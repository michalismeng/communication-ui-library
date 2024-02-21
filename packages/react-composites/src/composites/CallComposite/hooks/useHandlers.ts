// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CommonCallingHandlers } from '@internal/calling-component-bindings';
/* @conditional-compile-remove(spotlight) */
import { _ComponentCallingHandlers } from '@internal/calling-component-bindings';
import { CommonProperties, toFlatCommunicationIdentifier } from '@internal/acs-ui-common';
import { ReactElement } from 'react';
import memoizeOne from 'memoize-one';
import { CommonCallAdapter } from '..';
/* @conditional-compile-remove(video-background-effects) */
import { VideoBackgroundBlurEffect, VideoBackgroundReplacementEffect } from '..';
import { useAdapter } from '../adapter/CallAdapterProvider';
import { isCameraOn } from '../utils';
/* @conditional-compile-remove(PSTN-calls) */ /* @conditional-compile-remove(dtmf-dialer) */
import { DtmfTone } from '@azure/communication-calling';
/* @conditional-compile-remove(reaction) */
import { Reaction } from '@azure/communication-calling';
/* @conditional-compile-remove(video-background-effects) */
import type { BackgroundReplacementConfig, BackgroundBlurConfig } from '@azure/communication-calling';
/* @conditional-compile-remove(end-of-call-survey) */
import { CallSurvey, CallSurveyResponse } from '@azure/communication-calling';

/**
 * @private
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const useHandlers = <PropsT>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _component: (props: PropsT) => ReactElement | null
): Pick<CommonCallingHandlers, CommonProperties<CommonCallingHandlers, PropsT>> => {
  return createCompositeHandlers(useAdapter());
};

const createCompositeHandlers = memoizeOne(
  (
    adapter: CommonCallAdapter
  ): CommonCallingHandlers & /* @conditional-compile-remove(spotlight) */ Partial<_ComponentCallingHandlers> => {
    /* @conditional-compile-remove(spotlight) */
    const canSpotlight = adapter.getState().call?.capabilitiesFeature?.capabilities.spotlightParticipant.isPresent;
    return {
      onCreateLocalStreamView: async (options) => {
        return await adapter.createStreamView(undefined, options);
      },
      onCreateRemoteStreamView: async (userId, options) => {
        return await adapter.createStreamView(userId, options);
      },
      onHangUp: async (forEveryone?: boolean) => {
        await adapter.leaveCall(forEveryone);
      },
      /* @conditional-compile-remove(PSTN-calls) */
      onToggleHold: async () => {
        return adapter.getState().call?.state === 'LocalHold' ? await adapter.resumeCall() : await adapter.holdCall();
      },
      /* @conditional-compile-remove(PSTN-calls) */
      onAddParticipant: async (participant, options?) => {
        return await adapter.addParticipant(participant, options);
      },
      /* @conditional-compile-remove(PSTN-calls) */ /* @conditional-compile-remove(dtmf-dialer) */
      onSendDtmfTone: async (dtmfTone: DtmfTone) => {
        await adapter.sendDtmfTone(dtmfTone);
      },
      onRemoveParticipant: async (userId) => {
        await adapter.removeParticipant(userId);
      },
      /* @conditional-compile-remove(raise-hand) */
      onRaiseHand: async () => {
        await adapter.raiseHand();
      },
      /* @conditional-compile-remove(raise-hand) */
      onLowerHand: async () => {
        await adapter.lowerHand();
      },
      /* @conditional-compile-remove(raise-hand) */
      onToggleRaiseHand: async () => {
        adapter.getState().call?.raiseHand.localParticipantRaisedHand
          ? await adapter.lowerHand()
          : await adapter.raiseHand();
      },
      /* @conditional-compile-remove(reaction) */
      onReactionClicked: async (reaction: Reaction) => {
        await adapter.onReactionClicked(reaction);
      },
      onSelectCamera: async (deviceInfo, options) => {
        await adapter.setCamera(deviceInfo, options);
      },
      onSelectMicrophone: async (deviceInfo) => {
        await adapter.setMicrophone(deviceInfo);
      },
      onSelectSpeaker: async (deviceInfo) => {
        await adapter.setSpeaker(deviceInfo);
      },
      onStartCall: (participants, options?) => {
        const rawIds = participants.map((participant) => toFlatCommunicationIdentifier(participant));
        return adapter.startCall(rawIds, options);
      },
      onStartScreenShare: async () => {
        await adapter.startScreenShare();
      },
      onStopScreenShare: async () => {
        await adapter.stopScreenShare();
      },
      onToggleCamera: async (options) => {
        isCameraOn(adapter.getState()) ? await adapter.stopCamera() : await adapter.startCamera(options);
      },
      onToggleMicrophone: async () => {
        return adapter.getState().call?.isMuted ? await adapter.unmute() : await adapter.mute();
      },
      onToggleScreenShare: async () => {
        return adapter.getState().call?.isScreenSharingOn
          ? await adapter.stopScreenShare()
          : await adapter.startScreenShare();
      },
      onStartLocalVideo: async () => {
        if (adapter.getState().call) {
          return adapter.startCamera();
        }
      },
      onDisposeLocalStreamView: async () => {
        return adapter.disposeLocalVideoStreamView();
      },
      onDisposeRemoteStreamView: async (userId) => {
        return adapter.disposeStreamView(userId);
      },
      onDisposeRemoteScreenShareStreamView: async (userId) => {
        return adapter.disposeScreenShareStreamView(userId);
      },
      onDisposeRemoteVideoStreamView: async (userId) => {
        return adapter.disposeRemoteVideoStreamView(userId);
      },
      /* @conditional-compile-remove(call-readiness) */
      askDevicePermission: async (constrain) => {
        return adapter.askDevicePermission(constrain);
      },
      /* @conditional-compile-remove(video-background-effects) */
      onRemoveVideoBackgroundEffects: async () => {
        return await adapter.stopVideoBackgroundEffects();
      },
      /* @conditional-compile-remove(video-background-effects) */
      onBlurVideoBackground: async (backgroundBlurConfig?: BackgroundBlurConfig) => {
        const blurConfig: VideoBackgroundBlurEffect = {
          effectName: 'blur',
          ...backgroundBlurConfig
        };
        return await adapter.startVideoBackgroundEffect(blurConfig);
      },
      /* @conditional-compile-remove(video-background-effects) */
      onReplaceVideoBackground: async (backgroundReplacementConfig: BackgroundReplacementConfig) => {
        const replacementConfig: VideoBackgroundReplacementEffect = {
          effectName: 'replacement',
          ...backgroundReplacementConfig
        };
        return await adapter.startVideoBackgroundEffect(replacementConfig);
      },
      /* @conditional-compile-remove(close-captions) */
      onStartCaptions: async (options) => {
        await adapter.startCaptions(options);
      },
      /* @conditional-compile-remove(close-captions) */
      onStopCaptions: async () => {
        await adapter.stopCaptions();
      },
      /* @conditional-compile-remove(close-captions) */
      onSetSpokenLanguage: async (language) => {
        await adapter.setSpokenLanguage(language);
      },
      /* @conditional-compile-remove(close-captions) */
      onSetCaptionLanguage: async (language) => {
        await adapter.setCaptionLanguage(language);
      },
      /* @conditional-compile-remove(end-of-call-survey) */
      onSubmitSurvey: async (survey: CallSurvey): Promise<CallSurveyResponse | undefined> => {
        return await adapter.submitSurvey(survey);
      },
      /* @conditional-compile-remove(spotlight) */
      onStartSpotlight: async (userIds?: string[]): Promise<void> => {
        await adapter.startSpotlight(userIds);
      },
      /* @conditional-compile-remove(spotlight) */
      onStopSpotlight: async (userIds?: string[]): Promise<void> => {
        await adapter.stopSpotlight(userIds);
      },
      /* @conditional-compile-remove(spotlight) */
      onStartLocalSpotlight: canSpotlight
        ? async (): Promise<void> => {
            await adapter.startSpotlight();
          }
        : undefined,
      /* @conditional-compile-remove(spotlight) */
      onStopLocalSpotlight: async (): Promise<void> => {
        await adapter.stopSpotlight();
      },
      /* @conditional-compile-remove(spotlight) */
      onStartRemoteSpotlight: canSpotlight
        ? async (userIds?: string[]): Promise<void> => {
            await adapter.startSpotlight(userIds);
          }
        : undefined,
      /* @conditional-compile-remove(spotlight) */
      onStopRemoteSpotlight: canSpotlight
        ? async (userIds?: string[]): Promise<void> => {
            await adapter.stopSpotlight(userIds);
          }
        : undefined
    };
  }
);
