import React, { useMemo } from 'react'

import { FormikErrors, FormikTouched, FormikValues } from 'formik'

import { Row, Col } from 'reactstrap'
import { AnyAction } from 'typescript-fsa'

import { useTranslation } from 'react-i18next'

import { setScenario, renameCurrentScenario } from '../state/actions'
import { State } from '../state/state'

import { ScenarioDatum, SeverityDistributionDatum } from '../../../algorithms/types/Param.types'

import { ColCustom } from '../../Layout/ColCustom'
import { CardWithControls } from '../../Form/CardWithControls'
import { stringsToOptions } from '../../Form/FormDropdownOption'

import { ScenarioLoaderModalButton } from '../ScenarioLoader/ScenarioLoaderModalButton'

import { ScenarioCardContainment } from './ScenarioCardContainment'
import { ScenarioCardEpidemiological } from './ScenarioCardEpidemiological'
import { ScenarioCardPopulation } from './ScenarioCardPopulation'
import { SeverityCard } from './SeverityCard'
import { ScenarioTitle } from './ScenarioTitle'

import './ScenarioTitle.scss'

export function getColumnSizes(areResultsMaximized: boolean) {
  if (areResultsMaximized) {
    return { colPopulation: { xxl: 6 }, colEpidemiological: { xxl: 6 } }
  }

  return { colPopulation: { xl: 6 }, colEpidemiological: { xl: 6 } }
}

export interface ScenarioCardProps {
  scenario: ScenarioDatum
  severity: SeverityDistributionDatum[]
  scenarioState: State
  errors?: FormikErrors<FormikValues>
  touched?: FormikTouched<FormikValues>
  setSeverity(severity: SeverityDistributionDatum[]): void
  scenarioDispatch(action: AnyAction): void
  areResultsMaximized: boolean
}

function ScenarioCard({
  scenario,
  severity,
  scenarioState,
  errors,
  touched,
  setSeverity,
  scenarioDispatch,
  areResultsMaximized,
}: ScenarioCardProps) {
  const { t } = useTranslation()
  const scenarioOptions = stringsToOptions(scenarioState.scenarios)
  const { colPopulation, colEpidemiological } = getColumnSizes(areResultsMaximized)

  const title: string = scenarioState.current

  function handleScenarioRename(newScenario: string) {
    scenarioDispatch(renameCurrentScenario({ name: newScenario }))
  }

  const presetLoader = useMemo(() => {
    function handleChangeScenario(newScenario: string) {
      scenarioDispatch(setScenario({ name: newScenario }))
    }

    return (
      <ScenarioLoaderModalButton
        scenarioOptions={scenarioOptions}
        onScenarioSelect={handleChangeScenario}
        scenarioDispatch={scenarioDispatch}
        setSeverity={setSeverity}
      />
    )
  }, [scenarioOptions, scenarioDispatch, setSeverity])

  return (
    <CardWithControls
      identifier="scenarioName"
      label={<h2 className="p-0 m-0 d-inline text-truncate">{t('Scenario')}</h2>}
      help={t('Combination of population, epidemiology, and mitigation scenarios')}
      className="card--main"
      controls={presetLoader}
    >
      <>
        <Row>
          <Col xl={12} className="my-2">
            <ScenarioTitle title={title} onRename={handleScenarioRename} />
          </Col>
        </Row>
        <Row>
          <ColCustom {...colPopulation} className="my-2">
            <ScenarioCardPopulation errors={errors} touched={touched} />
          </ColCustom>

          <ColCustom {...colEpidemiological} className="my-2">
            <ScenarioCardEpidemiological errors={errors} touched={touched} />
          </ColCustom>
        </Row>

        <Row noGutters>
          <Col className="my-2">
            <ScenarioCardContainment scenario={scenario} errors={errors} touched={touched} />
          </Col>
        </Row>

        <Row noGutters>
          <Col className="my-2">
            <SeverityCard
              severity={severity}
              setSeverity={setSeverity}
              scenarioState={scenarioState}
              scenarioDispatch={scenarioDispatch}
            />
          </Col>
        </Row>
      </>
    </CardWithControls>
  )
}

export { ScenarioCard }
