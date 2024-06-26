// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Icon } from '@fluentui/react';
/* @conditional-compile-remove(file-sharing) */
import { AttachmentMetadata } from '../../types/Attachment';
import { isMessageTooLong } from './SendBoxUtils';
/* @conditional-compile-remove(file-sharing) */
import { ChatMessage } from '../../types';

/**
 * @private
 */
export const onRenderCancelIcon = (className: string): JSX.Element => {
  return <Icon iconName={'EditBoxCancel'} className={className} />;
};

/**
 * @private
 */
export const onRenderSubmitIcon = (className: string): JSX.Element => {
  return <Icon iconName={'EditBoxSubmit'} className={className} />;
};

type MessageState = 'OK' | 'too short' | 'too long';

function isMessageEmpty(
  messageText: string,
  /* @conditional-compile-remove(file-sharing) */
  attachmentMetadata?: AttachmentMetadata[]
): boolean {
  /* @conditional-compile-remove(file-sharing) */
  return messageText.trim().length === 0 && attachmentMetadata?.length === 0;
  return messageText.trim().length === 0;
}

/**
 * @private
 */
export function getMessageState(
  messageText: string,
  /* @conditional-compile-remove(file-sharing) */ attachmentMetadata: AttachmentMetadata[]
): MessageState {
  return isMessageEmpty(messageText, /* @conditional-compile-remove(file-sharing) */ attachmentMetadata)
    ? 'too short'
    : isMessageTooLong(messageText.length)
    ? 'too long'
    : 'OK';
}

/* @conditional-compile-remove(file-sharing) */
/**
 * @private
 * @TODO: Remove when file-sharing feature becomes stable.
 */
export function getMessageAttachedFilesMetadata(message: ChatMessage): AttachmentMetadata[] | undefined {
  return message.files;
}
