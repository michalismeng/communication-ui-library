// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ChatClient } from '@azure/communication-chat';
import * as express from 'express';
import { getEndpoint } from '../lib/envHelper';
import { threadIdToModeratorCredentialMap } from '../lib/chat/threadIdToModeratorTokenMap';

const router = express.Router();
interface AddUserParam {
  Id: string;
  DisplayName: string;
}

router.post('/:threadId', async function (req, res, next) {
  const addUserParam: AddUserParam = req.body;
  const threadId = req.params['threadId'];
  const moderatorCredential = threadIdToModeratorCredentialMap.get(threadId);

  const chatClient = new ChatClient(getEndpoint(), moderatorCredential);
  const chatThreadClient = await chatClient.getChatThreadClient(threadId);

  await chatThreadClient.addParticipants({
    participants: [
      {
        id: { communicationUserId: addUserParam.Id },
        displayName: addUserParam.DisplayName
      }
    ]
  });
  res.sendStatus(201);
});

export default router;
