// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActiveErrorMessage, Dialpad, DtmfTone } from '@internal/react-components';
import { MobileChatSidePaneTabHeaderProps } from '../../common/TabHeader';
import { CallCompositeOptions } from '../CallComposite';
import { SidePaneRenderer } from '../components/SidePane/SidePaneProvider';
import { CapabilitiesChangeNotificationBarProps } from '../components/CapabilitiesChangedNotificationBar';
import React, { useEffect, useMemo, useState } from 'react';
import { useAdapter } from '../adapter/CallAdapterProvider';
import { CommonCallAdapter } from '../adapter';
import { Stack, Text, useTheme } from '@fluentui/react';
import { getReadableTime } from '../utils/timerUtils';
import { DtmfDialpadContentTimerStyles } from '../styles/DtmfDialpadPage.styles';
import { RemoteParticipantState } from '@internal/calling-stateful-client';
import { isPhoneNumberIdentifier } from '@azure/communication-common';
import { useSelector } from '../hooks/useSelector';
import { getStartTime } from '../selectors/baseSelectors';

/**
 * @internal
 */
export interface DialpadPageProps {
  mobileView: boolean;
  options?: CallCompositeOptions;
  modalLayerHostId: string;
  updateSidePaneRenderer: (renderer: SidePaneRenderer | undefined) => void;
  mobileChatTabHeader?: MobileChatSidePaneTabHeaderProps;
  latestErrors: ActiveErrorMessage[];
  onDismissError: (error: ActiveErrorMessage) => void;
  /* @conditional-compile-remove(capabilities) */
  capabilitiesChangedNotificationBarProps?: CapabilitiesChangeNotificationBarProps;
  onSetDialpadPage: () => void;
  dtmfDialerPresent: boolean;
}

interface DialpadPageContentProps {
  mobileView: boolean;
  adapter: CommonCallAdapter;
}

const DtmfDialpadPageContent = (props: DialpadPageContentProps): JSX.Element => {
  const { adapter } = props;
  const adapterState = adapter.getState();
  const theme = useTheme();

  const calleeId = adapterState.targetCallees?.[0];
  const remoteParticipants = adapterState.call?.remoteParticipants;
  let calleeName;

  if (remoteParticipants) {
    const remoteParticipantValues: RemoteParticipantState[] = Object.values(remoteParticipants);
    if (calleeId && isPhoneNumberIdentifier(calleeId)) {
      calleeName = calleeId.phoneNumber;
    } else {
      calleeName = remoteParticipantValues.find((p) => p.identifier === calleeId);
    }
  }

  return (
    <Stack style={{ height: '100%', width: '100%', background: theme.palette.white }}>
      <Stack verticalAlign={'center'} style={{ margin: 'auto' }}>
        <DtmfDialerContentTimer />
        <Text style={{ margin: 'auto' }}>
          {calleeName && calleeName !== 'Unnamed participant' ? calleeName?.toString() : ''}
        </Text>
        <Dialpad
          onSendDtmfTone={async (tone: DtmfTone) => {
            await adapter.sendDtmfTone(tone);
          }}
          longPressTrigger={props.mobileView ? 'touch' : 'mouseAndTouch'}
          dialpadMode={'dtmf'}
        ></Dialpad>
      </Stack>
    </Stack>
  );
};

const DtmfDialerContentTimer = (): JSX.Element => {
  const [time, setTime] = useState<number>(0);
  const elapsedTime = getReadableTime(time);
  const statefulStartTime = useSelector(getStartTime);
  const startTime = useMemo(() => {
    return statefulStartTime ?? new Date(Date.now());
  }, [statefulStartTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date(Date.now()).getTime() - startTime?.getTime() ?? 0);
    }, 10);
    return () => {
      clearInterval(interval);
    };
  }, [startTime]);

  return <Text styles={DtmfDialpadContentTimerStyles}>{elapsedTime}</Text>;
};

/**
 * @internal
 */
export const DtmfDialpadPage = (props: DialpadPageProps): JSX.Element => {
  const adapter = useAdapter();

  return <DtmfDialpadPageContent adapter={adapter} mobileView={props.mobileView} />;
};
