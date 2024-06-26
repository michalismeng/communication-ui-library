// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Icon, IconButton, Spinner, SpinnerSize, TooltipHost } from '@fluentui/react';
import React, { useCallback, useState } from 'react';
import { useMemo } from 'react';
/* @conditional-compile-remove(file-sharing) */
import { useLocale } from '../localization';
import { _AttachmentCard } from './AttachmentCard';
import { _AttachmentCardGroup } from './AttachmentCardGroup';
import { iconButtonClassName } from './styles/IconButton.styles';
import { _formatString } from '@internal/acs-ui-common';
import { AttachmentMetadata, FileDownloadHandler } from '../types/Attachment';

/**
 * Represents the type of attachment
 * @public
 */
export type ChatAttachmentType = 'unknown' | 'image' | /* @conditional-compile-remove(file-sharing) */ 'file';

/**
 * Strings of _AttachmentDownloadCards that can be overridden.
 *
 * @internal
 */
export interface _AttachmentDownloadCardsStrings {
  /** Aria label to notify user when focus is on attachment download button. */
  downloadAttachment: string;
  attachmentCardGroupMessage: string;
}

/**
 * @internal
 */
export interface _AttachmentDownloadCardsProps {
  /**
   * User id of the local participant
   */
  userId: string;
  /**
   * A chat message metadata that includes file metadata
   */
  fileMetadata?: AttachmentMetadata[];
  /**
   * A function of type {@link FileDownloadHandler} for handling attachment downloads.
   * If the function is not specified, the attachment's `url` will be opened in a new tab to
   * initiate the download.
   */
  downloadHandler?: FileDownloadHandler;
  /**
   * Optional callback that runs if downloadHandler returns {@link FileDownloadError}.
   */
  onDownloadErrorMessage?: (errMsg: string) => void;
  /**
   * Optional aria label strings for attachment download cards
   */
  strings?: _AttachmentDownloadCardsStrings;
}

const attachmentDownloadCardsStyle = {
  marginTop: '0.25rem'
};

const actionIconStyle = { height: '1rem' };

/**
 * @internal
 */
export const _AttachmentDownloadCards = (props: _AttachmentDownloadCardsProps): JSX.Element => {
  const { userId, fileMetadata } = props;
  const [showSpinner, setShowSpinner] = useState(false);
  const localeStrings = useLocaleStringsTrampoline();

  const downloadAttachmentButtonString = useMemo(
    () => () => {
      return props.strings?.downloadAttachment ?? localeStrings.downloadAttachment;
    },
    [props.strings?.downloadAttachment, localeStrings.downloadAttachment]
  );

  const isShowDownloadIcon = useCallback((attachment: AttachmentMetadata): boolean => {
    /* @conditional-compile-remove(file-sharing) */
    return attachment.payload?.teamsFileAttachment !== 'true';
    return true;
  }, []);

  const attachmentCardGroupDescription = useMemo(
    () => () => {
      const fileGroupLocaleString =
        props.strings?.attachmentCardGroupMessage ?? localeStrings.attachmentCardGroupMessage;
      /* @conditional-compile-remove(file-sharing) */
      return _formatString(fileGroupLocaleString, {
        attachmentCount: `${fileMetadata?.length ?? 0}`
      });
      return _formatString(fileGroupLocaleString, {
        attachmentCount: `${fileMetadata?.length ?? 0}`
      });
    },
    [props.strings?.attachmentCardGroupMessage, localeStrings.attachmentCardGroupMessage, fileMetadata]
  );

  const fileDownloadHandler = useCallback(
    async (userId: string, file: AttachmentMetadata) => {
      if (!props.downloadHandler) {
        window.open(file.url, '_blank', 'noopener,noreferrer');
      } else {
        setShowSpinner(true);
        try {
          const response = await props.downloadHandler(userId, file);
          setShowSpinner(false);
          if (response instanceof URL) {
            window.open(response.toString(), '_blank', 'noopener,noreferrer');
          } else {
            props.onDownloadErrorMessage && props.onDownloadErrorMessage(response.errorMessage);
          }
        } finally {
          setShowSpinner(false);
        }
      }
    },
    [props]
  );
  if (!fileMetadata || fileMetadata.length === 0 || !fileMetadata) {
    return <></>;
  }

  return (
    <div style={attachmentDownloadCardsStyle} data-ui-id="file-download-card-group">
      <_AttachmentCardGroup ariaLabel={attachmentCardGroupDescription()}>
        {fileMetadata &&
          fileMetadata.map((attachment) => (
            <TooltipHost content={downloadAttachmentButtonString()} key={attachment.name}>
              <_AttachmentCard
                attachmentName={attachment.name}
                key={attachment.name}
                attachmentExtension={attachment.extension}
                actionIcon={
                  showSpinner ? (
                    <Spinner size={SpinnerSize.medium} aria-live={'polite'} role={'status'} />
                  ) : true && isShowDownloadIcon(attachment) ? (
                    <IconButton className={iconButtonClassName} ariaLabel={downloadAttachmentButtonString()}>
                      <DownloadIconTrampoline />
                    </IconButton>
                  ) : undefined
                }
                actionHandler={() => fileDownloadHandler(userId, attachment)}
              />
            </TooltipHost>
          ))}
      </_AttachmentCardGroup>
    </div>
  );
};

/**
 * @private
 */
const DownloadIconTrampoline = (): JSX.Element => {
  // @conditional-compile-remove(file-sharing)
  return <Icon data-ui-id="file-download-card-download-icon" iconName="DownloadFile" style={actionIconStyle} />;
  // Return _some_ available icon, as the real icon is beta-only.
  return <Icon iconName="EditBoxCancel" style={actionIconStyle} />;
};

const useLocaleStringsTrampoline = (): _AttachmentDownloadCardsStrings => {
  /* @conditional-compile-remove(file-sharing) */
  return useLocale().strings.messageThread;
  return { downloadAttachment: '', attachmentCardGroupMessage: '' };
};
