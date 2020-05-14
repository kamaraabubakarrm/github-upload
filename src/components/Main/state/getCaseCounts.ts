import { CaseCountsArray, CaseCountsData, CaseCountsDatum, Convert } from '../../../algorithms/types/Param.types'
import validateCaseCountsArray, { errors } from '../../../.generated/latest/validateCaseCountsArray'
import caseCountsDataRaw from '../../../assets/data/caseCounts.json'
import { ImportedCaseCount } from '../Results/ImportCaseCountDialog'
import { NONE_COUNTRY_NAME } from './state'

const CUSTOM_CASE_COUNT_KEY = 'customCaseCount'

function validate(): CaseCountsData[] {
  const valid = validateCaseCountsArray(caseCountsDataRaw)
  if (!valid) {
    throw errors
  }

  // FIXME: we cannot afford to Convert.toCaseCounts(), too slow
  return ((caseCountsDataRaw as unknown) as CaseCountsArray).all
}

const caseCountsData = validate()
export const caseCountsNames = caseCountsData.map((cc) => cc.name)

export function getCaseCountsData(name: string) {
  if (name === NONE_COUNTRY_NAME) {
    return []
  }

  const caseCountFound = caseCountsData.find((cc) => cc.name === name)
  if (!caseCountFound) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`
        Developer warning: requested case counts for "${name}", but this entry is not present in the data.
        This probably means that the data has an incorrect reference to non-existing case counts.

        Returning an empty case counts array. However the app state will not be adjusted.
        This means that the incorrect name "${name}" will be visible in the UI, but no actual case data will be present`)
    }
    return []
  }

  // FIXME: this should be changed, too hacky
  const caseCounts = Convert.toCaseCountsData(JSON.stringify(caseCountFound))
  return caseCounts.data
}

export function getSortedNonEmptyCaseCounts(key: string): CaseCountsDatum[] {
  return getCaseCountsData(key)
    .filter((d) => d.cases || d.deaths || d.icu || d.hospitalized)
    .sort((a, b) => (a.time > b.time ? 1 : -1))
}

export function getUserCaseCount(): ImportedCaseCount | undefined {
  const data = sessionStorage.getItem(CUSTOM_CASE_COUNT_KEY)
  return data ? JSON.parse(data) : undefined
}

export function saveUserCaseCount(userCaseCount: ImportedCaseCount): void {
  sessionStorage.setItem(CUSTOM_CASE_COUNT_KEY, JSON.stringify(userCaseCount))
}

export function resetUserCaseCount(): void {
  sessionStorage.removeItem(CUSTOM_CASE_COUNT_KEY)
}
