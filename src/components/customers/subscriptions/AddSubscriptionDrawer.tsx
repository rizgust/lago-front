import { forwardRef, useState, useImperativeHandle, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useFormik } from 'formik'
import { object, string } from 'yup'
import { DateTime } from 'luxon'
import { useNavigate } from 'react-router-dom'

import { Drawer, DrawerRef, Button, Alert, Typography } from '~/components/designSystem'
import {
  ComboBoxField,
  TextInputField,
  DatePickerField,
  ButtonSelectorField,
} from '~/components/form'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import {
  updateOverwritePlanVar,
  overwritePlanVar,
  resetOverwritePlanVar,
  SubscriptionUpdateInfo,
} from '~/core/apolloClient'
import { theme, Card, DrawerTitle, DrawerContent, DrawerSubmitButton } from '~/styles'
import { CREATE_PLAN_ROUTE } from '~/core/router'
import {
  CreateSubscriptionInput,
  BillingTimeEnum,
  PlanInterval,
  StatusTypeEnum,
} from '~/generated/graphql'
import { useAddSubscription } from '~/hooks/customer/useAddSubscription'

export interface AddSubscriptionDrawerRef {
  openDialog: (existingSubscription?: SubscriptionUpdateInfo) => unknown
  closeDialog: () => unknown
}

interface AddSubscriptionDrawerProps {
  customerName: string
  customerId: string
}

export const AddSubscriptionDrawer = forwardRef<
  AddSubscriptionDrawerRef,
  AddSubscriptionDrawerProps
>(({ customerId, customerName }: AddSubscriptionDrawerProps, ref) => {
  const navigate = useNavigate()
  const drawerRef = useRef<DrawerRef>(null)
  const currentDateRef = useRef<string>(DateTime.now().toISO())
  const [existingSubscription, setExistingSubscription] = useState<
    SubscriptionUpdateInfo | undefined
  >(undefined)
  const { translate } = useInternationalization()
  const formikProps = useFormik<Omit<CreateSubscriptionInput, 'customerId'>>({
    initialValues: {
      // @ts-ignore
      planId: undefined,
      name: '',
      subscriptionDate: currentDateRef?.current,
      billingTime: BillingTimeEnum.Calendar,
    },
    validationSchema: object().shape({
      planId: string().required(''),
      subscriptionDate: string().required(''),
    }),
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: async (values, formikBag) => {
      const canClose = await onCreate(customerId, values)

      if (canClose) {
        drawerRef?.current?.closeDrawer()
        formikBag.resetForm()
      }
    },
  })
  const {
    loading,
    selectedPlan,
    comboboxPlansData,
    billingTimeHelper,
    errorCode,
    onCreate,
    onOpenDrawer,
  } = useAddSubscription({
    existingSubscription,
    planId: formikProps.values.planId,
    billingTime: formikProps.values.billingTime,
    subscriptionDate: formikProps.values.subscriptionDate,
  })

  useImperativeHandle(ref, () => ({
    openDialog: (infos) => {
      setExistingSubscription(infos)
      drawerRef.current?.openDrawer()
    },
    closeDialog: () => drawerRef.current?.closeDrawer(),
  }))

  useEffect(() => {
    const { subscriptionInput, updateInfo } = overwritePlanVar()

    if (!!subscriptionInput) {
      const { planId, name, billingTime, subscriptionDate } = subscriptionInput

      formikProps.setValues({
        subscriptionDate: subscriptionDate || currentDateRef?.current,
        planId: planId || '',
        name: name || undefined,
        billingTime: billingTime || BillingTimeEnum.Calendar,
      })
      if (!!updateInfo) {
        setExistingSubscription({
          subscriptionId: updateInfo?.subscriptionId as string,
          existingPlanId: updateInfo?.existingPlanId as string,
          periodEndDate: updateInfo?.periodEndDate as string,
          status: updateInfo?.status,
        })
      }
      resetOverwritePlanVar()
      drawerRef?.current?.openDrawer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Drawer
      ref={drawerRef}
      title={translate(
        existingSubscription ? 'text_6328e70de459381ed4ba50be' : 'text_6328e70de459381ed4ba50bc',
        { customerName }
      )}
      onClose={formikProps.resetForm}
      onOpen={onOpenDrawer}
    >
      <>
        <DrawerContent>
          <DrawerTitle>
            <Typography variant="headline">
              {translate(
                existingSubscription
                  ? 'text_6328e70de459381ed4ba50c2'
                  : 'text_6328e70de459381ed4ba50c0',
                { customerName }
              )}
            </Typography>
            <Typography>
              {translate(
                existingSubscription
                  ? 'text_6328e70de459381ed4ba50c6'
                  : 'text_6328e70de459381ed4ba50c4'
              )}
            </Typography>
          </DrawerTitle>

          <Card>
            <Typography variant="subhead">{translate('text_6328e70de459381ed4ba50ca')}</Typography>
            <PlanBlock>
              <ComboBoxField
                name="planId"
                formikProps={formikProps}
                label={translate('text_625434c7bb2cb40124c81a29')}
                data={comboboxPlansData}
                loading={loading}
                isEmptyNull={false}
                loadingText={translate('text_625434c7bb2cb40124c81a35')}
                placeholder={translate('text_625434c7bb2cb40124c81a31')}
                emptyText={translate('text_625434c7bb2cb40124c81a37')}
                PopperProps={{ displayInDialog: true }}
              />
              {!!formikProps?.values?.planId && (
                <Button
                  variant="quaternary"
                  startIcon="pen"
                  size="large"
                  onClick={() => {
                    updateOverwritePlanVar({
                      parentId: formikProps?.values?.planId,
                      subscriptionInput: formikProps?.values,
                      customerId: customerId,
                      updateInfo: existingSubscription,
                    })
                    navigate(CREATE_PLAN_ROUTE)
                  }}
                >
                  {translate('text_6328e911e1eede3a429e8861')}
                </Button>
              )}
            </PlanBlock>
            {!!formikProps?.values?.planId && (
              <>
                <TextInputField
                  name="name"
                  formikProps={formikProps}
                  label={translate('text_62d7f6178ec94cd09370e2b9')}
                  placeholder={translate('text_62d7f6178ec94cd09370e2cb')}
                  helperText={translate('text_62d7f6178ec94cd09370e2d9')}
                />
                {!existingSubscription && (
                  <>
                    <DatePickerField
                      name="subscriptionDate"
                      label={translate('text_62ea7cd44cd4b14bb9ac1dbb')}
                      formikProps={formikProps}
                    />
                    <ButtonSelectorField
                      name="billingTime"
                      label={translate('text_62ea7cd44cd4b14bb9ac1db7')}
                      formikProps={formikProps}
                      helperText={billingTimeHelper}
                      options={[
                        {
                          label:
                            selectedPlan?.interval === PlanInterval.Yearly
                              ? translate('text_62ebd597d5d5130a03ced107')
                              : selectedPlan?.interval === PlanInterval.Weekly
                              ? translate('text_62ebd597d5d5130a03ced101')
                              : translate('text_62ea7cd44cd4b14bb9ac1db9'),
                          value: BillingTimeEnum.Calendar,
                        },
                        {
                          label: translate('text_62ea7cd44cd4b14bb9ac1dbb'),
                          value: BillingTimeEnum.Anniversary,
                        },
                      ]}
                    />
                  </>
                )}
              </>
            )}

            {!!errorCode ? (
              <Alert type="danger">{translate('text_632dbaf1d577afb32ae751f5')}</Alert>
            ) : (
              <>
                {existingSubscription?.status === StatusTypeEnum.Active && (
                  <Alert type="info">
                    {translate('text_6328e70de459381ed4ba50d6', {
                      subscriptionEndDate: DateTime.fromISO(
                        existingSubscription?.periodEndDate as string
                      ).toFormat('LLL. dd, yyyy'),
                    })}
                  </Alert>
                )}
                {existingSubscription?.status === StatusTypeEnum.Pending && (
                  <Alert type="info">
                    {translate('text_6335e50b0b089e1d8ed508da', {
                      subscriptionDate: DateTime.fromISO(
                        existingSubscription?.startDate as string
                      ).toFormat('LLL. dd, yyyy'),
                    })}
                  </Alert>
                )}
              </>
            )}
          </Card>

          <DrawerSubmitButton>
            <Button
              size="large"
              fullWidth
              disabled={!formikProps.isValid}
              onClick={formikProps.submitForm}
              data-test="submit"
            >
              {existingSubscription
                ? translate('text_6328e70de459381ed4ba50da')
                : translate('text_6328e70de459381ed4ba50d4', { customerName })}
            </Button>
          </DrawerSubmitButton>
        </DrawerContent>
      </>
    </Drawer>
  )
})

const PlanBlock = styled.div`
  display: flex;
  align-items: flex-end;

  > *:first-child {
    flex: 1;
  }

  > *:first-child:not(:last-child) {
    margin-right: ${theme.spacing(3)};
  }
`

AddSubscriptionDrawer.displayName = 'AddSubscriptionDrawer'
