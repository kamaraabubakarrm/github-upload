import React, { useState } from 'react'
import { Button } from 'reactstrap'
import { useTranslation, getI18n } from 'react-i18next'
import { FormikErrors, FormikTouched, FormikValues } from 'formik'
import { FaTrash } from 'react-icons/fa'
import { caseCountsNames, resetUserCaseCount, saveUserCaseCount, getUserCaseCount } from '../state/getCaseCounts'
import { NONE_COUNTRY_NAME } from '../state/state'
import { FormDropdown } from '../../Form/FormDropdown'
import ImportCaseCountDialog, { ImportedCaseCount } from '../Results/ImportCaseCountDialog'
import { FormCustom } from '../../Form/FormCustom'

export interface ConfirmedCasesDataPickerProps {
  errors?: FormikErrors<FormikValues>
  touched?: FormikTouched<FormikValues>
}

const caseCountOptions = caseCountsNames.map((name) => ({ value: name, label: name }))
caseCountOptions.push({ value: NONE_COUNTRY_NAME, label: getI18n().t(NONE_COUNTRY_NAME) })

export function ConfirmedCasesDataPicker({ errors, touched }: ConfirmedCasesDataPickerProps) {
  const { t } = useTranslation()
  const [userImportedData, setUserImportedData] = useState<ImportedCaseCount | undefined>(getUserCaseCount)
  const [showImportModal, setShowImportModal] = useState<boolean>(false)

  const toggleShowImportModal = () => setShowImportModal(!showImportModal)
  const resetImports = () => storeUserImportedData()

  // TODO handle storage errors
  // TODO handle simulation autorun when importing a custom file
  const storeUserImportedData = (userCaseCount?: ImportedCaseCount) => {
    if (!userCaseCount) {
      resetUserCaseCount()
    } else {
      saveUserCaseCount(userCaseCount)
    }

    setUserImportedData(userCaseCount)
  }

  if (userImportedData) {
    return (
      <FormCustom
        identifier="population.caseCountsName"
        label={t('Confirmed cases')}
        help={t('Select region for which to plot confirmed case and death counts.')}
      >
        {/* TODO Handle large file names */}
        {userImportedData.fileName || t('Custom data')}
        <Button
          color="secondary"
          outline
          size="sm"
          onClick={resetImports}
          title={'Delete the imported case count data'}
          className="ml-2"
        >
          <FaTrash />
        </Button>
      </FormCustom>
    )
  }

  return (
    <>
      <FormDropdown<string>
        identifier="population.caseCountsName"
        label={t('Confirmed cases')}
        help={t('Select region for which to plot confirmed case and death counts.')}
        options={caseCountOptions}
        errors={errors}
        touched={touched}
      />
      <div className="text-right pb-2">
        <Button size="sm" color="link" onClick={toggleShowImportModal} className="pt-0">
          {t('or import your own data')}
        </Button>
      </div>
      <ImportCaseCountDialog
        showModal={showImportModal}
        toggleShowModal={toggleShowImportModal}
        onDataImported={storeUserImportedData}
      />
    </>
  )
}
