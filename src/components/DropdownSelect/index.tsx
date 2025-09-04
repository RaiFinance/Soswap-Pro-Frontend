import React, { useState } from 'react'
import styled from 'styled-components'

import Row, { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { ChevronDown as Arrow } from 'react-feather'

export const StyledIcon = styled.div`
  color: ${({ theme }) => theme.text1};
  display: flex;
  align-items: center;
`
const Wrapper = styled.div<{
  open?: boolean,
  color?: string
}>`
  z-index: 20;
  position: relative;
  border: 1px solid ${({ open, color }) => (open ? color : 'rgba(0, 0, 0, 0.15);')} 
  min-width: 100px;
  padding: 4px 10px;
  padding-right: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  :hover {
    cursor: pointer;
  }
`

const Dropdown = styled.div`
  position: absolute;
  top: 34px;
  padding-top: 40px;
  width: calc(100% - 40px);
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 10px 10px;
  border-radius: 8px;
  width: 100%;
  font-weight: 500;
  font-size: 1rem;
  color: black;
  :hover {
    cursor: pointer;
  }
`

const ArrowStyled = styled(Arrow)`
  height: 20px;
  width: 20px;
  margin-left: 6px;
`

const DropdownSelect = ({ options, active, setActive, color }: any) => {
  const [showDropdown, toggleDropdown] = useState(false)

  return (
    <Wrapper open={showDropdown} color={color}>
      <RowBetween onClick={() => toggleDropdown(!showDropdown)}>
        {active}
        <StyledIcon>
          <ArrowStyled />
        </StyledIcon>
      </RowBetween>
      {showDropdown && (
        <Dropdown>
          <AutoColumn gap="20px">
            {Object.keys(options).map((key, index) => {
              let option = options[key]
              return (
                option !== active && (
                  <Row
                    onClick={() => {
                      toggleDropdown(!showDropdown)
                      setActive(option)
                    }}
                    key={index}
                  >
                    {option}
                  </Row>
                )
              )
            })}
          </AutoColumn>
        </Dropdown>
      )}
    </Wrapper>
  )
}

export default DropdownSelect
