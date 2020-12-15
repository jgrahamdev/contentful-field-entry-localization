import React from 'react';
import { Paragraph } from '@contentful/forma-36-react-components';
import { SidebarExtensionSDK } from 'contentful-ui-extensions-sdk';

import ArticleWrapperSidebar from './ArticleWrapperSidebar'
import ArticleSidebar from './ArticleSidebar'

interface SidebarProps {
  sdk: SidebarExtensionSDK;
}

const Sidebar = (props: SidebarProps) => {
  let sys = props.sdk.entry.getSys()
  let contentType = sys.contentType.sys.id

  if (contentType === 'articleWrapperFlexible') {
    return <ArticleWrapperSidebar sdk={props.sdk} />
  }

  if (contentType === 'article') {
    return <ArticleSidebar sdk={props.sdk} />
  }

  return <Paragraph>Hello Sidebar Component</Paragraph>;
};

export default Sidebar;
