import { getProjects, Tree } from '@nx/devkit'
import { anchorApplicationGenerator } from '@solana-developers/preset-anchor'
import { Keypair } from '@solana/web3.js'
import { join } from 'path'
import { features, ReactFeature, reactFeatureGenerator } from '../generators/react-feature'
import { createNextPageRouteAnchorCounter } from './create-next-page-route-anchor-counter'
import { NormalizedReactApplicationSchema } from './normalize-react-application-schema'

export async function setupAnchorReactFeature(
  tree: Tree,
  options: NormalizedReactApplicationSchema,
  sourceRoot: string,
  preset: 'react' | 'next',
  keypair?: Keypair,
) {
  if (options.ui === 'none') {
    return
  }
  if (options.anchor === 'none' || getProjects(tree).has(options.anchorName)) {
    return
  }

  const featureName = options.anchor
  const feature: ReactFeature = features.find((feature) => feature.toString() === `anchor-${featureName}`)

  if (!feature) {
    throw new Error(`Invalid anchor feature: ${featureName}`)
  }

  // Create the Anchor application
  await anchorApplicationGenerator(tree, { name: options.anchorName, skipFormat: true }, keypair)

  // Create the React feature
  await reactFeatureGenerator(
    tree,
    {
      name: featureName,
      anchorName: options.anchorName,
      webName: options.webName,
      skipFormat: true,
      feature,
      preset,
      ui: options.ui,
    },
    keypair,
  )

  // For Next.js, create a page route for the counter feature
  if (preset === 'next' && options.ui !== 'none') {
    createNextPageRouteAnchorCounter(tree, join(sourceRoot, `app/${featureName}/page.tsx`), featureName)
  }
}
