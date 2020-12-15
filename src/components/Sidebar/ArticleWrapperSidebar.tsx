import React, { useEffect, useState } from 'react';
import { Paragraph, Form, CheckboxField, Button } from '@contentful/forma-36-react-components';
import { SidebarExtensionSDK } from 'contentful-ui-extensions-sdk';

import { deepClone } from '../../lib/deepClone'

interface SidebarProps {
  sdk: SidebarExtensionSDK;
}

const ArticleWrapperSidebar = (props: SidebarProps) => {

  const [selectedLocales, setSelectedLocales] = useState<Array<string>>([])
  const [masterReference, setMasterReference] = useState<any>(props.sdk.entry.fields.locale.getValue())
  const [fieldLocales, setFieldLocales] = useState<Array<string>>([])
  const [loading, setLoading] = useState<boolean>(false)

  // const fieldLocales:Array<string> = useRef([])
  useEffect(() => {
    const locales:Array<string> = props.sdk.entry.fields.locale.locales
    let index = locales.indexOf(props.sdk.locales.default)

    if (index > -1) {
      locales.splice(index, 1)
    }

    setFieldLocales(locales)
  }, [props.sdk.locales.default, props.sdk.entry.fields.locale.locales])

  useEffect(() => {
    props.sdk.window.startAutoResizer()
    return () => {
      props.sdk.window.stopAutoResizer()
    }
  }, [props.sdk.window])

  useEffect(() => {

    const detachLocaleChangeHandler: Function | null = props.sdk.entry.fields.locale.onValueChanged(value => {
      if (value) {
        setMasterReference(value)
      }
    })
    return () => {
      return detachLocaleChangeHandler()
    }
  }, [props.sdk.entry.fields.locale])

  const onLocaleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    let value:string = e.currentTarget.value
    let index = selectedLocales.indexOf(value)

    if (index === -1) {
      setSelectedLocales([...selectedLocales, ...[value]])
    } else {
      let updated = [...selectedLocales]
      updated.splice(index, 1)

      setSelectedLocales(updated)
    }
  }

  const onSubmit = (e:React.MouseEvent<HTMLElement>) => {
    setLoading(true)

    for (let locale of selectedLocales) {
      props.sdk.space.getEntry(masterReference.sys.id)
      .then(entry => deepClone(entry, locale, props))
      .then((clone) => {
        let link = {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: clone.sys.id
          }
        }
        return props.sdk.entry.fields.locale.setValue(link, locale)
      })
      .then(() => {
        setLoading(false)
      })
    }
  }

  return (
    <>
      <Form spacing="default">
        <Paragraph>Select locales to update:</Paragraph>
        {fieldLocales.map((locale:string) => (
          <CheckboxField
            key={locale}
            labelText={locale}
            onChange={onLocaleChange}
            checked={selectedLocales.indexOf(locale) > -1}
            value={locale}
          />
        ))}
      </Form>
      <Button
        buttonType="positive"
        onClick={onSubmit}
        disabled={!masterReference || selectedLocales.length === 0 || loading}
        loading={loading}
      >
        Submit
      </Button>
    </>
  );
};

export default ArticleWrapperSidebar;
