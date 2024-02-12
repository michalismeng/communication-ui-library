// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallWithChatAdapter } from './CallWithChatAdapter';
import { ChatAdapter, ChatAdapterState } from '../../ChatComposite';
/* @conditional-compile-remove(teams-inline-images-and-file-sharing) */
import { ResourceDetails } from '../../ChatComposite';
/* @conditional-compile-remove(file-sharing) */
import { FileUploadManager } from '../../ChatComposite';
/* @conditional-compile-remove(teams-inline-images-and-file-sharing) */
import { AttachmentDownloadResult } from '@internal/react-components';
/* @conditional-compile-remove(file-sharing) */
import { AttachmentMetadata } from '@internal/react-components';
import { ErrorBarStrings } from '@internal/react-components';
import { CallWithChatAdapterState } from '../state/CallWithChatAdapterState';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Facade around the CallWithChatAdapter to satisfy the chat adapter interface.
 *
 * @private
 */
export class CallWithChatBackedChatAdapter implements ChatAdapter {
  private callWithChatAdapter: CallWithChatAdapter;

  // For onStateChange we must convert CallWithChat state to chat state. This involves creating a new handler to be passed into the onStateChange.
  // In order to unsubscribe the handler when offStateChange is called we must have a mapping of the original handler to the newly created handler.
  private eventStore: Map<(state: ChatAdapterState) => void, (state: CallWithChatAdapterState) => void> = new Map();

  constructor(callWithChatAdapter: CallWithChatAdapter) {
    this.callWithChatAdapter = callWithChatAdapter;
  }

  public fetchInitialData = async (): Promise<void> => await this.callWithChatAdapter.fetchInitialData();
  public sendMessage = async (content: string): Promise<void> => await this.callWithChatAdapter.sendMessage(content);
  public sendReadReceipt = async (chatMessageId: string): Promise<void> =>
    await this.callWithChatAdapter.sendReadReceipt(chatMessageId);
  public sendTypingIndicator = async (): Promise<void> => await this.callWithChatAdapter.sendTypingIndicator();
  public removeParticipant = async (userId: string): Promise<void> =>
    await this.callWithChatAdapter.removeParticipant(userId);
  public loadPreviousChatMessages = async (messagesToLoad: number): Promise<boolean> =>
    await this.callWithChatAdapter.loadPreviousChatMessages(messagesToLoad);
  public dispose = (): void => this.callWithChatAdapter.dispose();

  public onStateChange = (handler: (state: ChatAdapterState) => void): void => {
    const convertedHandler = (state: CallWithChatAdapterState): void => {
      handler(chatAdapterStateFromCallWithChatAdapterState(state));
    };
    this.callWithChatAdapter.onStateChange(convertedHandler);
    this.eventStore.set(handler, convertedHandler);
  };
  public offStateChange = (handler: (state: ChatAdapterState) => void): void => {
    const convertedHandler = this.eventStore.get(handler);
    convertedHandler && this.callWithChatAdapter.offStateChange(convertedHandler);
  };
  public getState = (): ChatAdapterState =>
    chatAdapterStateFromCallWithChatAdapterState(this.callWithChatAdapter.getState());

  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  public on = (event: any, listener: any): void => {
    switch (event) {
      case 'error':
        return this.callWithChatAdapter.on('chatError', listener);
      case 'participantsAdded':
        return this.callWithChatAdapter.on('chatParticipantsAdded', listener);
      case 'participantsRemoved':
        return this.callWithChatAdapter.on('chatParticipantsRemoved', listener);
      default:
        return this.callWithChatAdapter.on(event, listener);
    }
  };
  public off = (event: any, listener: any): void => {
    switch (event) {
      case 'error':
        return this.callWithChatAdapter.off('chatError', listener);
      case 'participantsAdded':
        return this.callWithChatAdapter.off('chatParticipantsAdded', listener);
      case 'participantsRemoved':
        return this.callWithChatAdapter.off('chatParticipantsRemoved', listener);
      default:
        return this.callWithChatAdapter.off(event, listener);
    }
  };
  public updateMessage = async (messageId: string, content: string, metadata?: Record<string, string>): Promise<void> =>
    await this.callWithChatAdapter.updateMessage(messageId, content, metadata);
  public deleteMessage = async (messageId: string): Promise<void> =>
    await this.callWithChatAdapter.deleteMessage(messageId);

  public clearErrors = (errorTypes: (keyof ErrorBarStrings)[]): void => {
    throw new Error(`Method not supported in CallWithChatComposite.`);
  };

  public setTopic = async (topicName: string): Promise<void> => {
    throw new Error(`Chat Topics are not supported in CallWithChatComposite.`);
  };

  /* @conditional-compile-remove(file-sharing) */
  public registerActiveFileUploads = (files: File[]): FileUploadManager[] => {
    return this.callWithChatAdapter.registerActiveFileUploads(files);
  };

  /* @conditional-compile-remove(file-sharing) */
  public registerCompletedFileUploads = (metadata: AttachmentMetadata[]): FileUploadManager[] => {
    return this.callWithChatAdapter.registerCompletedFileUploads(metadata);
  };

  /* @conditional-compile-remove(file-sharing) */
  public clearFileUploads = (): void => {
    this.callWithChatAdapter.clearFileUploads();
  };

  /* @conditional-compile-remove(file-sharing) */
  public cancelFileUpload = (id: string): void => {
    this.callWithChatAdapter.cancelFileUpload(id);
  };

  /* @conditional-compile-remove(file-sharing) */
  public updateFileUploadProgress = (id: string, progress: number): void => {
    this.callWithChatAdapter.updateFileUploadProgress(id, progress);
  };

  /* @conditional-compile-remove(file-sharing) */
  public updateFileUploadErrorMessage = (id: string, errorMessage: string): void => {
    this.callWithChatAdapter.updateFileUploadErrorMessage(id, errorMessage);
  };

  /* @conditional-compile-remove(file-sharing) */
  public updateFileUploadMetadata = (id: string, metadata: AttachmentMetadata): void => {
    this.callWithChatAdapter.updateFileUploadMetadata(id, metadata);
  };

  /* @conditional-compile-remove(teams-inline-images-and-file-sharing) */
  // ToDo: This method is to be removed
  public async downloadAttachment(options: { attachmentUrl: string }): Promise<AttachmentDownloadResult> {
    return await this.callWithChatAdapter.downloadAttachment(options);
  }
  /* @conditional-compile-remove(teams-inline-images-and-file-sharing) */
  public downloadResourceToCache(resourceDetails: ResourceDetails): void {
    this.callWithChatAdapter.downloadResourceToCache(resourceDetails);
  }
  /* @conditional-compile-remove(teams-inline-images-and-file-sharing) */
  public removeResourceFromCache(resourceDetails: ResourceDetails): void {
    this.callWithChatAdapter.removeResourceFromCache(resourceDetails);
  }
}

function chatAdapterStateFromCallWithChatAdapterState(
  callWithChatAdapterState: CallWithChatAdapterState
): ChatAdapterState {
  if (!callWithChatAdapterState.chat) {
    throw new Error('Chat thread state id undefined.');
  }

  return {
    userId: callWithChatAdapterState.userId,
    displayName: callWithChatAdapterState.displayName || '',
    thread: callWithChatAdapterState.chat,
    latestErrors: callWithChatAdapterState.latestChatErrors,
    /* @conditional-compile-remove(file-sharing) */
    fileUploads: callWithChatAdapterState.fileUploads
  };
}
