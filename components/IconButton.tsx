import { Tooltip } from "@chakra-ui/react";
import styled from "@emotion/styled";
import React, { ReactNode } from "react";

type IconButtonProps = {
  icon?: ReactNode;
  tooltip?: string;
  text?: string;
};

const IconButton = ({ icon, tooltip, text }: IconButtonProps) => {
  return (
    <Tooltip label={tooltip} fontSize="md">
      <IconWrapper>{icon}</IconWrapper>
    </Tooltip>
  );
};

export default IconButton;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 100px;
  cursor: pointer;
  margin-right: 4px;

  &:hover {
    background: ${({ theme }) => theme.hoverBack};
  }
`;