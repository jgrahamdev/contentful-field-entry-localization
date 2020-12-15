import { SidebarExtensionSDK } from 'contentful-ui-extensions-sdk';

interface SidebarProps {
  sdk: SidebarExtensionSDK;
}

export const deepClone = async (entry:any, locale:string, props:SidebarProps) => {
  const defaultEntries:any[] = []
  const localizedEntries:any[] = []
  const contentTypes:any[] = []
  const contentTypeRefFields:any = {}

  const getContentType = async (contentTypeId: string) => {
    let find = contentTypes.find(contentType => contentType.sys.id === contentTypeId)
    if (find) {
      return find
    }

    let contentType = await props.sdk.space.getContentType(contentTypeId)
    contentTypes.push(contentType)

    return contentType
  }

  const getcontentTypeRefFields = async (contentTypeId: string) => {
    if (contentTypeRefFields[contentTypeId]) {
      return contentTypeRefFields[contentTypeId]
    }

    let contentType:any = await getContentType(contentTypeId)
    let refFields:any[] = []

    for (let field of contentType.fields) {
      if (field.type === 'Link' && field.linkType === 'Entry') {
        refFields.push(field)
      } else if (field.type === 'Array' && field.items.type === 'Link' && field.items.linkType === 'Entry') {
        refFields.push(field)
      }
    }

    contentTypeRefFields[contentTypeId] = refFields
    return refFields
  }

  const findEntries = async (entryId: string) => {
    if (defaultEntries.find(entry => entry.sys.id === entryId)) {
      return
    }

    let entry:any = await props.sdk.space.getEntry(entryId)
    let ct:any = await getContentType(entry.sys.contentType.sys.id)
    let refFields:any[] = []

    for (let field of ct.fields) {
      if (field.type === 'Link' && field.linkType === 'Entry') {
        refFields.push(field)
      } else if (field.type === 'Array' && field.items.type === 'Link' && field.items.linkType === 'Entry') {
        refFields.push(field)
      }
    }

    for (let field of refFields) {
      if (entry.fields[field.id]) {
        if (field.type === 'Link') {
          await findEntries(entry.fields[field.id][props.sdk.locales.default].sys.id)
        }
        else {
          for (let link of entry.fields[field.id][props.sdk.locales.default] as any) {
            await findEntries(link.sys.id)
          }
        }
      }
    }

    defaultEntries.push(entry)
  }

  const createLocalizedEntries = async (locale:string) => {
    for (let defaultEntry of defaultEntries) {
      let localizedEntry = {
        fields: {} as any,
        metadata: defaultEntry.metadata
      }

      let ct:any = await getContentType(defaultEntry.sys.contentType.sys.id)

      for (let field of ct.fields) {
        localizedEntry.fields[field.id] = {} as any
        if (field.localized && defaultEntry.fields[field.id] && defaultEntry.fields[field.id][locale]) {
          localizedEntry.fields[field.id][locale] =  defaultEntry.fields[field.id][locale]
        } else if (!field.localized && defaultEntry.fields[field.id]) {
          // console.log(defaultEntry.fields[field.id][props.sdk.locales.default])
          localizedEntry.fields[field.id] = defaultEntry.fields[field.id]
        }
      }

      // console.log(localizedEntry)
      let createdEntry:any = await props.sdk.space.createEntry(ct.sys.id, localizedEntry)
      createdEntry.defaultId = defaultEntry.sys.id
      localizedEntries.push(createdEntry)
    }
  }

  const updateReferences = async () => {
    for (let index in localizedEntries) {
      let refFields:any = await getcontentTypeRefFields(localizedEntries[index].sys.contentType.sys.id)
      let updateEntry = {
        fields: localizedEntries[index].fields,
        metadata: localizedEntries[index].metadata,
        sys: localizedEntries[index].sys
      }

      for (let field of refFields) {
        if (updateEntry.fields[field.id]) {
          if (field.type === 'Link') {
            let localEntry = localizedEntries.find(entry => entry.defaultId === updateEntry.fields[field.id][props.sdk.locales.default].sys.id)
            updateEntry.fields[field.id][props.sdk.locales.default].sys.id = localEntry.sys.id
          } else {
            for (let index in updateEntry.fields[field.id][props.sdk.locales.default] as any) {
              let link = updateEntry.fields[field.id][props.sdk.locales.default][index]
              let localEntry = localizedEntries.find(entry => entry.defaultId === link.sys.id)
              updateEntry.fields[field.id][props.sdk.locales.default][index].sys.id = localEntry.sys.id
            }
          }
        }
      }

      props.sdk.space.updateEntry(updateEntry)
    }
  }

  await findEntries(entry.sys.id)

  await createLocalizedEntries(locale)

  await updateReferences()

  let cloned = localizedEntries.find(local => local.defaultId === entry.sys.id)

  if (cloned) {
    delete cloned.defaultId
    return cloned
  }
}


