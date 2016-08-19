import {Action} from "../../Action";
import {TreeGrid} from "../TreeGrid";

export class ClearSelectionAction<DATA> extends Action {

        constructor(treeGrid: TreeGrid<DATA>) {
            super(this.createLabel(treeGrid.getRoot().getFullSelection().length));

            this.setEnabled(true);
            this.onExecuted(() => {
                treeGrid.getRoot().clearStashedSelection();
                treeGrid.getGrid().clearSelection();
            });

            treeGrid.onSelectionChanged(() => {
                var selectedCount = treeGrid.getRoot().getFullSelection().length;
                this.setLabel(this.createLabel(selectedCount));
                this.setEnabled(!!selectedCount);
            });
        }

        private createLabel(count: number): string {
            return "Clear Selection" + ( !!count ? " (" + count + ")" : "");
        }
    }
