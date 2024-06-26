// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Icon, IconButton } from '@fluentui/react';
import React from 'react';
import { _AttachmentCard } from './AttachmentCard';
import { _AttachmentCardGroup } from './AttachmentCardGroup';
import { extension } from './utils';
import { iconButtonClassName } from './styles/IconButton.styles';
import { useMemo } from 'react';
import { useLocaleAttachmentCardStringsTrampoline } from './utils/common';
import { SendBoxErrorBarError } from './SendBoxErrorBar';

/**
 * Attributes required for SendBox to show attachment uploads like name, progress etc.
 * @beta
 */
export interface ActiveFileUpload {
  /**
   * Unique identifier for the file upload.
   */
  id: string;

  /**
   * File name to be rendered for uploaded file.
   */
  filename: string;

  /**
   * A number between 0 and 1 indicating the progress of the upload.
   * This is unrelated to the `uploadComplete` property.
   * It is only used to show the progress of the upload.
   * Progress of 1 doesn't mark the upload as complete, set the `uploadComplete`
   * property to true to mark the upload as complete.
   */
  progress: number;

  /**
   * Error to be displayed to the user if the upload fails.
   */
  error?: SendBoxErrorBarError;

  /**
   * `true` means that the upload is completed.
   * This is independent of the upload `progress`.
   */
  uploadComplete?: boolean;
}

/**
 * Strings of _AttachmentUploadCards that can be overridden.
 *
 * @internal
 */
export interface _AttachmentUploadCardsStrings {
  /** Aria label to notify user when focus is on cancel attachment upload button. */
  removeAttachment: string;
  /** Aria label to notify user attachment uploading starts. */
  uploading: string;
  /** Aria label to notify user attachment is uploaded. */
  uploadCompleted: string;
}

/**
 * @internal
 */
export interface FileUploadCardsProps {
  /**
   * Optional array of active attachment uploads where each object has attibutes
   * of a attachment upload like name, progress, errormessage etc.
   */
  activeFileUploads?: ActiveFileUpload[];
  /**
   * Optional callback to remove the attachment upload before sending by clicking on
   * cancel icon.
   */
  onCancelFileUpload?: (attachmentId: string) => void;
  /**
   * Optional arialabel strings for attachment upload cards
   */
  strings?: _AttachmentUploadCardsStrings;
}

const actionIconStyle = { height: '1rem' };

/**
 * @internal
 */
export const _AttachmentUploadCards = (props: FileUploadCardsProps): JSX.Element => {
  const attachments = props.activeFileUploads;

  const localeStrings = useLocaleAttachmentCardStringsTrampoline();

  const removeAttachmentButtonString = useMemo(
    () => () => {
      return props.strings?.removeAttachment ?? localeStrings.removeAttachment;
    },
    [props.strings?.removeAttachment, localeStrings.removeAttachment]
  );

  if (!attachments || attachments.length === 0) {
    return <></>;
  }

  return (
    <_AttachmentCardGroup>
      {attachments &&
        attachments
          .filter((attachment) => !attachment.error)
          .map((attachment) => (
            <_AttachmentCard
              attachmentName={attachment.filename}
              progress={attachment.progress}
              key={attachment.id}
              attachmentExtension={extension(attachment.filename)}
              actionIcon={
                <IconButton className={iconButtonClassName} ariaLabel={removeAttachmentButtonString()}>
                  <Icon iconName="CancelFileUpload" style={actionIconStyle} />
                </IconButton>
              }
              actionHandler={() => {
                props.onCancelFileUpload && props.onCancelFileUpload(attachment.id);
              }}
              strings={props.strings}
            />
          ))}
    </_AttachmentCardGroup>
  );
};
