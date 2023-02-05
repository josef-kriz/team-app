import Dexie, {liveQuery} from 'dexie'
import {from, Observable} from "rxjs";

/**
 * For each use of liveQuery, we want to check whether we are within a transaction.
 * We can't use liveQuery within a transaction otherwise the transaction will be already completed when a value emits.
 *
 * @param query a Dexie query
 */
export const conditionalLiveQuery = <T>(query: () => Promise<T>): Observable<T> => {
  if (Dexie.currentTransaction) return from(query())
  
  return from(liveQuery(query))
}
