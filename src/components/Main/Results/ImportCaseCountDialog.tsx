import React, { useCallback, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { useTranslation, getI18n } from 'react-i18next'
import Papa from 'papaparse'
import FileUploadZone from '../Compare/FileUploadZone'
import { processImportedData } from '../../../algorithms/utils/importedData'
import Message from '../../Misc/Message'
import { ProcessingError, ProcessingErrorCode } from '../../../algorithms/utils/exceptions'
import { CaseCountsDatum } from '../../../algorithms/types/Param.types'

const localizedErrorMessage = 'Error: {{message}}'

export interface ImportedCaseCount {
  fileName: string
  data: CaseCountsDatum[]
}

export interface ImportCaseCountDialogProps {
  showModal: boolean
  toggleShowModal(): void
  onDataImported(data: ImportedCaseCount): void
}

const allowedFileTypes = [
  'text/plain',
  'text/csv',
  'application/csv',
  'text/x-csv',
  'application/vnd.ms-excel',
  'text/tab-separated-values',
  'text/tsv',
  'application/tsv',
  '.csv',
  '.tsv',
]

function getMessageForError(error: ProcessingError): string {
  let message
  switch (error.errorCode) {
    case ProcessingErrorCode.MissingTimeField:
      message = getI18n().t('The time field is missing.')
      break
    case ProcessingErrorCode.InvalidField:
      message = getI18n().t('{{value}} is not a valid field value.', { value: error.message })
      break
    default:
      throw new Error('Unknown processing error.')
  }

  return getI18n().t(localizedErrorMessage, { message })
}

export default function ImportCaseCountDialog({
  toggleShowModal,
  showModal,
  onDataImported,
}: ImportCaseCountDialogProps) {
  const { t } = useTranslation()
  const [filesToImport, setFilesToImport] = useState<File[]>([])
  const [errorMessage, setErrorMessage] = useState<string>()

  const onImportRejected = () =>
    setErrorMessage(t(localizedErrorMessage, { message: t('Only one CSV or TSV file can be imported.') }))

  const onImportClick = useCallback(async () => {
    if (filesToImport.length === 0) {
      setErrorMessage(t(localizedErrorMessage, { message: t('No file has been uploaded.') }))
      return
    }

    const file: File = filesToImport.values().next().value
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      comments: '#',
      complete: ({ data, errors, meta }: Papa.ParseResult) => {
        if (meta.aborted || !data?.length) {
          // TODO display more detailed information to the user in case of error
          setErrorMessage(
            t(localizedErrorMessage, {
              message: t("The file could not be loaded. Make sure that it's a valid CSV file."),
            }),
          )

          // TODO log only in dev mode
          console.error('Parsing error', errors)
          return
        }

        try {
          onDataImported({
            fileName: file.name,
            data: processImportedData(data),
          })
        } catch (error) {
          setErrorMessage(getMessageForError(error))
          return
        }

        toggleShowModal()
      },
    })

    // TODO handle loading for huge files
  }, [filesToImport, t, toggleShowModal, onDataImported])

  const isFileUploaded: boolean = filesToImport.length > 0

  return (
    <Modal className="height-fit" centered size="lg" isOpen={showModal} toggle={toggleShowModal}>
      <ModalHeader toggle={toggleShowModal}>{t('Import more data')}</ModalHeader>
      <ModalBody>
        <Message color="danger">{errorMessage}</Message>
        <p>
          {/* TODO add more information on the expected schema here */}
          {t(
            'You can import your own data to display them along with the results of the simulation, allowing to compare the results of the model with real cases.',
          )}
        </p>
        <FileUploadZone
          onFilesUploaded={setFilesToImport}
          accept={allowedFileTypes}
          multiple={false}
          onFilesRejected={onImportRejected}
          dropZoneMessage={t('Drag and drop a case data file here, or click to select one.')}
          activeDropZoneMessage={t('Drop the file here...')}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggleShowModal}>
          {t('Cancel')}
        </Button>
        <Button color="primary" onClick={onImportClick} disabled={!isFileUploaded}>
          {t('Import')}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
