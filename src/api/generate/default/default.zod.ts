/**
 * Generated by orval v7.4.1 🍺
 * Do not edit manually.
 * FastAPI
 * OpenAPI spec version: 0.1.0
 */
import {
  z as zod
} from 'zod'

/**
 * @summary Read Root
 */
export const readRootGetResponse = zod.any()

/**
 * @summary Read Item
 */
export const readItemItemsItemIdGetParams = zod.object({
  "item_id": zod.number()
})

export const readItemItemsItemIdGetQueryParams = zod.object({
  "q": zod.string().or(zod.null()).optional()
})

export const readItemItemsItemIdGetResponse = zod.any()

