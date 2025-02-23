import { memo, useRef } from 'react'
import styled from 'styled-components'
import { gql } from '@apollo/client'
import { DateTime } from 'luxon'
import { generatePath } from 'react-router-dom'

import {
  theme,
  BaseListItem,
  ListItemLink,
  MenuPopper,
  PopperOpener,
  ItemContainer,
} from '~/styles'
import { Avatar, Typography, Skeleton, Popper, Button, Tooltip } from '~/components/designSystem'
import { CustomerItemFragment, AddCustomerDrawerFragmentDoc } from '~/generated/graphql'
import { CUSTOMER_DETAILS_ROUTE } from '~/core/router'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import {
  DeleteCustomerDialog,
  DeleteCustomerDialogRef,
} from '~/components/customers/DeleteCustomerDialog'
import { AddCustomerDrawer, AddCustomerDrawerRef } from '~/components/customers/AddCustomerDrawer'

gql`
  fragment CustomerItem on Customer {
    id
    name
    externalId
    createdAt
    canBeDeleted
    activeSubscriptionCount
    ...AddCustomerDrawer
  }

  ${AddCustomerDrawerFragmentDoc}
`

interface CustomerItemProps {
  customer: CustomerItemFragment
  rowId: string
}

export const CustomerItem = memo(({ rowId, customer }: CustomerItemProps) => {
  const deleteDialogRef = useRef<DeleteCustomerDialogRef>(null)
  const editDialogRef = useRef<AddCustomerDrawerRef>(null)
  const { id, name, externalId, createdAt, canBeDeleted, activeSubscriptionCount } = customer
  const { translate } = useInternationalization()

  return (
    <ItemContainer>
      <Item
        id={rowId}
        to={generatePath(CUSTOMER_DETAILS_ROUTE, { id })}
        tabIndex={0}
        data-test={name}
      >
        <CustomerNameSection>
          <ListAvatar
            variant="user"
            identifier={name as string}
            initials={!name ? '-' : name.split(' ').reduce((acc, n) => (acc = acc + n[0]), '')}
          />
          <NameBlock>
            <Typography color="textSecondary" variant="bodyHl" noWrap>
              {name || translate('text_62f272a7a60b4d7fadad911a')}
            </Typography>
            <Typography variant="caption" noWrap>
              {externalId}
            </Typography>
          </NameBlock>
        </CustomerNameSection>
        <PlanInfosSection>
          <Typography align="right">{activeSubscriptionCount}</Typography>
          <SmallCell align="right">
            {DateTime.fromISO(createdAt).toFormat('LLL. dd, yyyy')}
          </SmallCell>
        </PlanInfosSection>
        <ButtonMock />
      </Item>
      <Popper
        PopperProps={{ placement: 'bottom-end' }}
        opener={({ isOpen }) => (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <PopperOpener>
            <Tooltip
              placement="top-end"
              disableHoverListener={isOpen}
              title={translate('text_626162c62f790600f850b7b6')}
            >
              <Button icon="dots-horizontal" variant="quaternary" />
            </Tooltip>
          </PopperOpener>
        )}
      >
        {({ closePopper }) => (
          <MenuPopper>
            <Button
              startIcon="pen"
              variant="quaternary"
              align="left"
              onClick={() => {
                editDialogRef.current?.openDrawer()
                closePopper()
              }}
            >
              {translate('text_6261640f28a49700f1290df3')}
            </Button>
            <Tooltip
              disableHoverListener={canBeDeleted}
              title={translate('text_626162c62f790600f850b836')}
              placement="bottom-end"
            >
              <Button
                startIcon="trash"
                variant="quaternary"
                disabled={!canBeDeleted}
                align="left"
                onClick={() => {
                  deleteDialogRef.current?.openDialog()
                  closePopper()
                }}
              >
                {translate('text_6261640f28a49700f1290df5')}
              </Button>
            </Tooltip>
          </MenuPopper>
        )}
      </Popper>
      <AddCustomerDrawer ref={editDialogRef} customer={customer} />
      <DeleteCustomerDialog ref={deleteDialogRef} customer={customer} />
    </ItemContainer>
  )
})

CustomerItem.displayName = 'CustomerItem'

export const CustomerItemSkeleton = () => {
  return (
    <BaseListItem>
      <Skeleton variant="connectorAvatar" size="medium" marginRight={theme.spacing(3)} />
      <Skeleton variant="text" height={12} width={240} marginRight="auto" />
      <Skeleton variant="text" height={12} width={240} />
    </BaseListItem>
  )
}

const Item = styled(ListItemLink)`
  > *:not(:last-child) {
    margin-right: ${theme.spacing(6)};
  }
`

const SmallCell = styled(Typography)<{ $alignLeft?: boolean }>`
  width: 112px;
`

const ListAvatar = styled(Avatar)`
  margin-right: ${theme.spacing(3)};
`

const CustomerNameSection = styled.div`
  min-width: 0;
  margin-right: auto;
  display: flex;
  align-items: center;
  flex: 1;
`

const NameBlock = styled.div`
  min-width: 0;
`

const PlanInfosSection = styled.div`
  display: flex;
  > *:not(:last-child) {
    margin-right: ${theme.spacing(6)};

    ${theme.breakpoints.down('md')} {
      display: none;
    }
  }
`

const ButtonMock = styled.div`
  width: 40px;
`
