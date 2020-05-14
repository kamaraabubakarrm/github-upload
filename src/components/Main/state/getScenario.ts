import { omit } from 'lodash'

import { v4 as uuidv4 } from 'uuid'

import validateScenarioArray, { errors } from '../../../.generated/latest/validateScenarioArray'

import type {
  MitigationInterval,
  MitigationIntervalExternal,
  ScenarioArray,
  ScenarioData,
  ScenarioDatum,
  ScenarioDatumExternal,
} from '../../../algorithms/types/Param.types'

import { Convert } from '../../../algorithms/types/Param.types'

import scenariosRaw from '../../../assets/data/scenarios.json'

export function addId(interval: MitigationIntervalExternal): MitigationInterval {
  return { ...interval, id: uuidv4() }
}

export function removeId(interval: MitigationInterval): MitigationIntervalExternal {
  return omit(interval, 'id')
}

export function toInternal(scenario: ScenarioDatumExternal): ScenarioDatum {
  const { mitigationIntervals } = scenario.mitigation
  return {
    ...scenario,
    mitigation: {
      ...scenario.mitigation,
      mitigationIntervals: mitigationIntervals.map(addId),
    },
  }
}

export function toExternal(scenario: ScenarioDatum): ScenarioDatumExternal {
  const { mitigationIntervals } = scenario.mitigation
  return {
    ...scenario,
    mitigation: {
      ...scenario.mitigation,
      mitigationIntervals: mitigationIntervals.map(removeId),
    },
  }
}

function validate(): ScenarioData[] {
  const valid = validateScenarioArray(scenariosRaw)
  if (!valid) {
    throw errors
  }

  // FIXME: we cannot afford to Convert.toScenario(), too slow
  return ((scenariosRaw as unknown) as ScenarioArray).all
}

const scenarios = validate()
export const scenarioNames = scenarios.map((scenario) => scenario.name)

export function getScenario(name: string): ScenarioDatum {
  const scenarioFound = scenarios.find((s) => s.name === name)
  if (!scenarioFound) {
    throw new Error(`Error: scenario "${name}" not found in JSON`)
  }

  // FIXME: this should be changed, too hacky
  const { data } = Convert.toScenarioData(JSON.stringify(scenarioFound))
  return toInternal(data)
}
