/* eslint-disable react/prop-types */
import { useRef, memo } from 'react'
import { gql } from '@apollo/client'
import styled from 'styled-components'

import {
  AppliedCouponCaptionFragmentDoc,
  CustomerCouponFragment,
  useRemoveCouponMutation,
} from '~/generated/graphql'
import { SectionHeader } from '~/styles/customer'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { Typography, Avatar, Icon, Button, Tooltip } from '~/components/designSystem'
import { CouponCaption, CouponMixedType } from '~/components/coupons/CouponCaption'
import { theme, HEADER_TABLE_HEIGHT, NAV_HEIGHT } from '~/styles'
import { WarningDialog, WarningDialogRef } from '~/components/WarningDialog'
import { addToast } from '~/core/apolloClient'

import {
  AddCouponToCustomerDialog,
  AddCouponToCustomerDialogRef,
} from './AddCouponToCustomerDialog'

gql`
  fragment CustomerCoupon on AppliedCoupon {
    id
    ...AppliedCouponCaption
    coupon {
      id
      name
    }
  }

  mutation removeCoupon($input: TerminateAppliedCouponInput!) {
    terminateAppliedCoupon(input: $input) {
      id
    }
  }

  ${AppliedCouponCaptionFragmentDoc}
`

interface CustomerCouponsProps {
  coupons?: CustomerCouponFragment[] | null | undefined
  customerId: string
  customerName: string
}

export const CustomerCoupons = memo(
  ({ coupons, customerId, customerName }: CustomerCouponsProps) => {
    const removeDialogRef = useRef<WarningDialogRef>(null)
    const addCouponDialogRef = useRef<AddCouponToCustomerDialogRef>(null)
    const deleteCouponId = useRef<string | null>(null)
    const { translate } = useInternationalization()
    const [removeCoupon] = useRemoveCouponMutation({
      onCompleted({ terminateAppliedCoupon }) {
        if (!!terminateAppliedCoupon) {
          addToast({
            severity: 'success',
            message: translate('text_628b8c693e464200e00e49d1'),
          })
        }
      },
    })

    return (
      <>
        {!!(coupons || [])?.length && (
          <Container>
            <SectionHeader variant="subhead">
              {translate('text_628b8c693e464200e00e469d')}
              <Button
                variant="quaternary"
                align="left"
                onClick={() => {
                  addCouponDialogRef.current?.openDialog()
                }}
              >
                {translate('text_628b8dc14c71840130f8d8a1')}
              </Button>
            </SectionHeader>
            <ListHeader>
              <Typography variant="bodyHl" color="disabled" noWrap>
                {translate('text_628b8c693e464200e00e46ab')}
              </Typography>
            </ListHeader>
            {(coupons || []).map((appliedCoupon) => (
              <CouponNameSection key={appliedCoupon.id}>
                <ListAvatar variant="connector">
                  <Icon name="coupon" color="dark" />
                </ListAvatar>
                <NameBlock>
                  <Typography color="textSecondary" variant="bodyHl" noWrap>
                    {appliedCoupon.coupon?.name}
                  </Typography>
                  <CouponCaption
                    coupon={appliedCoupon as unknown as CouponMixedType}
                    variant="caption"
                  />
                </NameBlock>
                <DeleteTooltip
                  placement="top-end"
                  title={translate('text_628b8c693e464200e00e4a10')}
                >
                  <Button
                    variant="quaternary"
                    icon="trash"
                    onClick={() => {
                      deleteCouponId.current = appliedCoupon.id
                      removeDialogRef?.current?.openDialog()
                    }}
                  />
                </DeleteTooltip>
              </CouponNameSection>
            ))}
          </Container>
        )}
        <WarningDialog
          ref={removeDialogRef}
          title={translate('text_628b8c693e464200e00e465f')}
          description={translate('text_628b8c693e464200e00e466d')}
          onContinue={async () => {
            if (deleteCouponId.current) {
              await removeCoupon({
                variables: { input: { id: deleteCouponId.current } },
                refetchQueries: ['getCustomer'],
              })
            }
          }}
          continueText={translate('text_628b8c693e464200e00e4689')}
        />

        <AddCouponToCustomerDialog
          ref={addCouponDialogRef}
          customerId={customerId}
          customerName={customerName}
        />
      </>
    )
  }
)

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

const ListHeader = styled.div`
  height: ${HEADER_TABLE_HEIGHT}px;
  display: flex;
  align-items: center;
  box-shadow: ${theme.shadows[7]};
  > *:not(:last-child) {
    margin-right: ${theme.spacing(6)};
  }
`

const CouponNameSection = styled.div`
  margin-right: auto;
  display: flex;
  align-items: center;
  min-width: 0;
  height: ${NAV_HEIGHT}px;
  box-shadow: ${theme.shadows[7]};
  width: 100%;
`

const ListAvatar = styled(Avatar)`
  margin-right: ${theme.spacing(3)};
`

const NameBlock = styled.div`
  min-width: 0;
`

const DeleteTooltip = styled(Tooltip)`
  margin-left: auto;
`

CustomerCoupons.displayName = 'CustomerCoupons'
