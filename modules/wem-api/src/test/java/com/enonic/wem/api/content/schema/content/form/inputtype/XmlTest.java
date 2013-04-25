package com.enonic.wem.api.content.schema.content.form.inputtype;


import org.junit.Test;

import com.enonic.wem.api.content.data.Property;
import com.enonic.wem.api.content.data.type.ValueTypes;
import com.enonic.wem.api.content.schema.content.form.BreaksRequiredContractException;

public class XmlTest
{
    @Test(expected = BreaksRequiredContractException.class)
    public void checkBreaksRequiredContract_throws_exception_when_value_is_empty_string()
    {
        new Xml().checkBreaksRequiredContract( Property.newProperty().name( "myXml" ).type( ValueTypes.XML ).value( "" ).build() );
    }

    @Test(expected = BreaksRequiredContractException.class)
    public void checkBreaksRequiredContract_throws_exception_when_value_is_blank_string()
    {
        new Xml().checkBreaksRequiredContract( Property.newProperty().name( "myXml" ).type( ValueTypes.XML ).value( "  " ).build() );
    }
}
