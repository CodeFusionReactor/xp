package com.enonic.wem.api.content.schema.content.form.inputtype;


import com.enonic.wem.api.content.data.Property;
import com.enonic.wem.api.content.data.Value;
import com.enonic.wem.api.content.data.type.InvalidValueTypeException;
import com.enonic.wem.api.content.data.type.PropertyTool;
import com.enonic.wem.api.content.data.type.ValueTypes;
import com.enonic.wem.api.content.schema.content.form.BreaksRequiredContractException;
import com.enonic.wem.api.content.schema.content.form.InvalidValueException;

public class Address
    extends BaseInputType
{
    public Address()
    {
    }

    @Override
    public void checkValidity( final Property property )
        throws InvalidValueTypeException, InvalidValueException
    {
        PropertyTool.checkPropertyType( property, "street", ValueTypes.TEXT );
        PropertyTool.checkPropertyType( property, "postalCode", ValueTypes.TEXT );
        PropertyTool.checkPropertyType( property, "postalPlace", ValueTypes.TEXT );
        PropertyTool.checkPropertyType( property, "region", ValueTypes.TEXT );
        PropertyTool.checkPropertyType( property, "country", ValueTypes.TEXT );
    }

    @Override
    public void checkBreaksRequiredContract( final Property property )
        throws BreaksRequiredContractException
    {

    }


    @Override
    public Value newValue( final String value )
    {
        throw new UnsupportedOperationException();
    }
}

