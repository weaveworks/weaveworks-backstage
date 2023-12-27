import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styled from 'styled-components';
import Flex from './Flex';
import Modal from './Modal';
import { Button } from '@material-ui/core';
import { useToggleSuspendResource } from '../hooks/useToggleSuspendResource';
import { Deployment, Source } from './helpers';

export type Props = {
  data?: (Source | Deployment)[];
  selectedRow: string | null;
  className?: string;
  setSelectedRow: Dispatch<SetStateAction<string>>;
};

const MessageTextarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 100%;
  border-radius: ${props => props.theme.spacing.xxs};
  resize: none;
  margin-bottom: ${props => props.theme.spacing.base};
  padding: ${props => props.theme.spacing.xs};
  &:focus {
    outline: ${props => props.theme.colors.primary} solid 2px;
  }
`;

function SuspendMessageModal({
  data,
  selectedRow,
  className,
  setSelectedRow,
}: Props) {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [suspendMessage, setSuspendMessage] = useState('');
  const selectedResource = data?.find(
    d => `${d.obj.metadata.namespace}/${d.obj.metadata.name}` === selectedRow,
  );

  const { toggleSuspend } = useToggleSuspendResource(
    selectedResource as Source | Deployment,
    true,
    suspendMessage,
  );

  const closeHandler = () => {
    setSuspendMessage('');
    setOpenModal(false);
    setSelectedRow('');
  };

  const suspendHandler = () => {
    setSuspendMessage(suspendMessage);
    toggleSuspend();
    setSuspendMessage('');
    setOpenModal(false);
    setSelectedRow('');
  };

  const onClose = () => closeHandler();

  useEffect(() => setOpenModal(selectedRow !== ''), [selectedRow]);

  const content = (
    <>
      <MessageTextarea
        rows={5}
        value={suspendMessage}
        onChange={ev => setSuspendMessage(ev.target.value)}
      />
      <Flex wide end>
        <Button onClick={suspendHandler} color="inherit" variant="text">
          Suspend
        </Button>
      </Flex>
    </>
  );

  return (
    <Modal
      open={openModal}
      onClose={onClose}
      title="Suspend Reason"
      description="Add reason for suspending"
      children={content}
      className={className}
    />
  );
}

export default SuspendMessageModal;
