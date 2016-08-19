import {EventJson} from "../event/EventJson";
import {Event} from "../event/Event";
import {UriHelper} from "../util/UriHelper";
import {NodeEventJson} from "../event/NodeServerEvent";
import {ApplicationEvent} from "../application/ApplicationEvent";
import {ApplicationEventJson} from "../application/ApplicationEvent";
import {ContentServerEvent} from "../content/event/ContentServerEvent";
import {PrincipalServerEvent} from "../security/event/PrincipalServerEvent";

export class ServerEventsConnection {
        private static INSTANCE: ServerEventsConnection;
        
        private static KEEP_ALIVE_TIME: number = 30 * 1000;

        private ws: WebSocket;
        private reconnectInterval: number;
        private serverEventReceivedListeners: {(event: Event):void}[] = [];
        private connectionLostListeners: {():void}[] = [];
        private connectionRestoredListeners: {():void}[] = [];
        private connected: boolean = false;
        private disconnectTimeoutHandle: number;
        private keepConnected: boolean = false;
        private downTime: number;
        private keepAliveIntervalId: number;

        public static debug: boolean = false;

        constructor(reconnectIntervalSeconds: number = 5) {
            this.ws = null;
            this.reconnectInterval = reconnectIntervalSeconds * 1000;
        }

        public static getInstance(): ServerEventsConnection {
            if (!ServerEventsConnection.INSTANCE) {
                ServerEventsConnection.INSTANCE = new ServerEventsConnection();
            }

            return ServerEventsConnection.INSTANCE;
        }

        public connect() {
            if (!WebSocket) {
                console.warn('ServerEventsConnection: WebSockets not supported. Server events disabled.');
                return;
            }
            var wsUrl = UriHelper.joinPath(this.getWebSocketUriPrefix(), UriHelper.getAdminUriPrefix(), 'event');
            this.keepConnected = true;
            this.doConnect(wsUrl);
        }

        private doConnect(wsUrl: string) {
            this.ws = new WebSocket(wsUrl, 'text');

            this.ws.addEventListener('close', (ev: CloseEvent) => {
                clearInterval(this.keepAliveIntervalId);
                if (ServerEventsConnection.debug) {
                    var m = 'ServerEventsConnection: connection closed to ' + wsUrl;
                    if (this.downTime > 0) {
                        m += '\nUptime: ' + (new Date().getTime() - this.downTime);
                    }
                    console.warn(m);
                    this.downTime = new Date().getTime();
                }
                this.disconnectTimeoutHandle = setTimeout(() => {
                    if (this.connected) {
                        if (this.keepConnected) {
                            this.notifyConnectionLost();
                        }
                        this.connected = !this.connected;
                    }
                }, this.reconnectInterval + 1000);

                // attempt to reconnect
                if (this.keepConnected) {
                    setTimeout(()=> {
                        if (this.keepConnected) {
                            this.doConnect(wsUrl);
                        }
                    }, this.reconnectInterval);
                }
            });

            this.ws.addEventListener('error', (ev: ErrorEvent) => {
                if (ServerEventsConnection.debug) {
                    console.error('ServerEventsConnection: Unable to connect to server web socket on ' + wsUrl, ev);
                }
            });

            this.ws.addEventListener('message', (remoteEvent: any) => {
                var jsonEvent = <NodeEventJson> JSON.parse(remoteEvent.data);
                if (ServerEventsConnection.debug) {
                    console.debug('ServerEventsConnection: Server event [' + jsonEvent.type + ']', jsonEvent);
                }
                this.handleServerEvent(jsonEvent);
            });

            this.ws.addEventListener('open', (event) => {
                if (ServerEventsConnection.debug) {
                    var m = 'ServerEventsConnection: connection opened to ' + wsUrl;
                    if (this.downTime > 0) {
                        m += '\nDowntime: ' + (new Date().getTime() - this.downTime);
                    }
                    console.log(m);
                    this.downTime = new Date().getTime();
                }
                clearTimeout(this.disconnectTimeoutHandle);
                this.keepAliveIntervalId = setInterval(() => {
                    if (this.connected) {
                        this.ws.send("KeepAlive");
                        if (ServerEventsConnection.debug) {
                            console.log('ServerEventsConnection: Sending Keep Alive message');
                        }
                    }
                }, ServerEventsConnection.KEEP_ALIVE_TIME);
                if (!this.connected) {
                    this.notifyConnectionRestored();
                    this.connected = !this.connected;
                }
            });
        }

        public disconnect() {
            this.keepConnected = false;
            if (this.ws) {
                this.ws.close();
            }
        }

        public isConnected(): boolean {
            return this.ws.readyState === WebSocket.OPEN;
        }

        private handleServerEvent(eventJson: NodeEventJson): void {
            var clientEvent: Event = this.translateServerEvent(eventJson);

            if (clientEvent) {
                this.notifyServerEvent(clientEvent);
            }
        }

        private translateServerEvent(eventJson: EventJson): Event {
            var eventType = eventJson.type;

            if (eventType === 'application') {
                return ApplicationEvent.fromJson(<ApplicationEventJson>eventJson);
            }
            if (eventType.indexOf('node.') === 0) {
                let event;
                if (ContentServerEvent.is(<NodeEventJson>eventJson)) {
                    event = ContentServerEvent.fromJson(<NodeEventJson>eventJson);
                }

                if (PrincipalServerEvent.is(<NodeEventJson>eventJson)) {
                    event = PrincipalServerEvent.fromJson(<NodeEventJson>eventJson);
                }

                if (event && event.getNodeChange()) {
                    return event;
                }
            }

            return null;
        }

        private getWebSocketUriPrefix(): string {
            var loc = window.location, newUri;
            if (loc.protocol === "https:") {
                newUri = "wss:";
            } else {
                newUri = "ws:";
            }
            newUri += "//" + loc.host;
            return newUri;
        }

        private notifyServerEvent(serverEvent: Event) {
            this.serverEventReceivedListeners.forEach((listener: (event: Event)=>void)=> {
                listener.call(this, serverEvent);
            });
        }

        onServerEvent(listener: (event: Event) => void) {
            this.serverEventReceivedListeners.push(listener);
        }

        unServerEvent(listener: (event: Event) => void) {
            this.serverEventReceivedListeners =
                this.serverEventReceivedListeners.filter((currentListener: (event: Event)=>void)=> {
                    return currentListener != listener;
                });
        }

        private notifyConnectionLost() {
            this.connectionLostListeners.forEach((listener: (event)=>void)=> {
                listener.call(this);
            });
        }

        onConnectionLost(listener: () => void) {
            this.connectionLostListeners.push(listener);
        }

        unConnectionLost(listener: () => void) {
            this.connectionLostListeners =
                this.connectionLostListeners.filter((currentListener: ()=>void)=> {
                    return currentListener != listener;
                });
        }

        private notifyConnectionRestored() {
            this.connectionRestoredListeners.forEach((listener: (event)=>void)=> {
                listener.call(this);
            });
        }

        onConnectionRestored(listener: () => void) {
            this.connectionRestoredListeners.push(listener);
        }

        unConnectionRestored(listener: () => void) {
            this.connectionRestoredListeners =
                this.connectionRestoredListeners.filter((currentListener: ()=>void)=> {
                    return currentListener != listener;
                });
        }

    }

