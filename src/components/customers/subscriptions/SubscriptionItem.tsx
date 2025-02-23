import { forwardRef, ForwardedRef } from 'react'
import styled from 'styled-components'
import { gql } from '@apollo/client'
import { DateTime } from 'luxon'

import { theme, NAV_HEIGHT, HEADER_TABLE_HEIGHT } from '~/styles'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import {
  SubscriptionLinePlanFragmentDoc,
  SubscriptionItemFragment,
  StatusTypeEnum,
} from '~/generated/graphql'
import { Typography, Skeleton } from '~/components/designSystem'

import { AddSubscriptionDrawerRef } from './AddSubscriptionDrawer'
import { EditCustomerSubscriptionDrawerRef } from './EditCustomerSubscriptionDrawer'
import { TerminateCustomerSubscriptionDialogRef } from './TerminateCustomerSubscriptionDialog'
import { SubscriptionLine } from './SubscriptionLine'

gql`
  fragment SubscriptionItem on Subscription {
    id
    status
    startedAt
    nextPendingStartDate
    name
    nextName
    externalId
    periodEndDate
    subscriptionDate
    plan {
      ...SubscriptionLinePlan
    }
    nextPlan {
      ...SubscriptionLinePlan
    }
  }

  ${SubscriptionLinePlanFragmentDoc}
`

interface SubscriptionItemProps {
  subscription: SubscriptionItemFragment
}

export interface SubscriptionItemRef {
  addSubscriptionDialogRef: ForwardedRef<AddSubscriptionDrawerRef> | null
  editSubscriptionDrawerRef: ForwardedRef<EditCustomerSubscriptionDrawerRef> | null
  terminateSubscriptionDialogRef: ForwardedRef<TerminateCustomerSubscriptionDialogRef> | null
}

export const SubscriptionItem = forwardRef<SubscriptionItemRef, SubscriptionItemProps>(
  ({ subscription }: SubscriptionItemProps, ref) => {
    const { translate } = useInternationalization()
    const {
      id,
      plan,
      periodEndDate,
      status,
      nextPlan,
      nextPendingStartDate,
      externalId,
      nextName,
      name,
      startedAt,
      subscriptionDate,
    } = subscription
    const isDowngrading = !!nextPlan

    return (
      <SubscriptionContainer key={id}>
        {isDowngrading && !!nextPlan && (
          <SubscriptionLine
            ref={ref}
            subscriptionId={id}
            subscriptionExternalId={externalId}
            subscriptionName={nextName}
            date={nextPendingStartDate}
            plan={nextPlan}
            periodEndDate={periodEndDate}
            status={StatusTypeEnum.Pending}
            isDowngrade
          />
        )}
        <SubscriptionLine
          ref={ref}
          subscriptionId={id}
          subscriptionExternalId={externalId}
          subscriptionName={name}
          date={startedAt || subscriptionDate}
          periodEndDate={periodEndDate}
          plan={plan}
          status={status}
        />
        {isDowngrading && !!nextPlan && (
          <DateInfos variant="caption">
            {translate('text_62681c60582e4f00aa82938a', {
              planName: nextPlan?.name,
              dateStartNewPlan: !nextPendingStartDate
                ? '-'
                : DateTime.fromISO(nextPendingStartDate).toFormat('LLL. dd, yyyy'),
            })}
          </DateInfos>
        )}
        {status === StatusTypeEnum.Pending && (
          <DateInfos variant="caption">
            {translate('text_6335e50b0b089e1d8ed50960', {
              planName: plan?.name,
              startDate: DateTime.fromISO(subscriptionDate).toFormat('LLL. dd, yyyy'),
            })}
          </DateInfos>
        )}
      </SubscriptionContainer>
    )
  }
)

SubscriptionItem.displayName = 'SubscriptionItem'

export const SubscriptionItemSkeleton = () => {
  return (
    <SkeletonItem>
      <Skeleton variant="connectorAvatar" size="medium" marginRight="12px" />
      <div>
        <Skeleton variant="text" width={240} height={12} marginBottom="12px" />
        <Skeleton variant="text" width={120} height={12} />
      </div>
    </SkeletonItem>
  )
}

const SkeletonItem = styled.div`
  border: 1px solid ${theme.palette.grey[400]};
  height: ${NAV_HEIGHT}px;
  align-items: center;
  display: flex;
  padding: 0 ${theme.spacing(4)};
  border-radius: 12px;
`

const SubscriptionContainer = styled.div`
  border: 1px solid ${theme.palette.grey[400]};
  border-radius: 12px;

  > *:not(:last-child) {
    box-shadow: ${theme.shadows[7]};
  }
`

const DateInfos = styled(Typography)`
  height: ${HEADER_TABLE_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: end;
  padding: 0 ${theme.spacing(4)};
`
