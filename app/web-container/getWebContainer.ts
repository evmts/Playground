import { WebContainer } from '@webcontainer/api'
import { getInitialFiles } from './getInitialFiles'

let cachedContainer: Promise<WebContainer> | undefined = undefined

export async function getWebContainer() {
  cachedContainer = cachedContainer ?? WebContainer.boot().then(async (webcontainer) => {
    const files = getInitialFiles()
    await webcontainer.mount(files)
    return webcontainer
  })
  return cachedContainer
}
