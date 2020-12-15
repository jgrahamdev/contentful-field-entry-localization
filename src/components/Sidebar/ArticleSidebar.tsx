import React, { useEffect } from 'react';
import { Button, Note } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens'
import { SidebarExtensionSDK } from 'contentful-ui-extensions-sdk';
import { css } from 'emotion';

interface SidebarProps {
  sdk: SidebarExtensionSDK;
}

const styles = {
  note: css({
    marginBottom: tokens.spacingM
  })
}

const ArticleSidebar = (props: SidebarProps) => {

  const onSubmit = () => {
    let confirmOptions:any = {
      title: "Update Localized Content",
      message: "Are you sure you want to update this entry? Any unsaved changes will be overwritten.",
      intent: "positive",
      confirmLabel: "Update Content",
      cancelLabel: "Cancel"
    }

    props.sdk.dialogs.openConfirm(confirmOptions)
    .then((result) => console.log(result))
  }

  useEffect(() => {
    props.sdk.window.startAutoResizer()
    return (
      props.sdk.window.stopAutoResizer()
    )
  }, [props.sdk.window])

  let updated = false
  let note = "This article is up to date with the Master Entry"
  // console.log(props.sdk.entry.fields.title.getValue())
  if (!props.sdk.entry.fields.title.getValue() && props.sdk.entry.fields.title.getValue('en-CA') === 'Article - English CA') {
    note = "The master entry for this article has been updated. Update this article to receive the latest changes."
    updated = true
  }
  // .then((value:any) => console.log(value))

  return (
    <>
      <Note noteType={updated ? "warning" : "positive" } className={styles.note}>{note}</Note>
      <Button buttonType="positive" onClick={onSubmit} disabled={!updated}>Update Localized Content</Button>
    </>
  )
};

export default ArticleSidebar;
