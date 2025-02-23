import { useRef } from 'react'
import styled from 'styled-components'
import { gql } from '@apollo/client'

import {
  Typography,
  Button,
  Skeleton,
  Popper,
  Tooltip,
  Avatar,
  Icon,
} from '~/components/designSystem'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { theme, NAV_HEIGHT, MenuPopper } from '~/styles'
import { useWehbookSettingQuery } from '~/generated/graphql'
import { EditWebhookDialog, EditWebhookDialogRef } from '~/components/developers/EditWebhookDialog'
import {
  DeleteWebhookDialog,
  DeleteWebhookDialogRef,
} from '~/components/developers/DeleteWebhookDialog'
import { useCurrentUserInfosVar } from '~/core/apolloClient'

gql`
  query wehbookSetting {
    currentUser {
      id
      organizations {
        id
        webhookUrl
      }
    }
  }
`

const Webhook = () => {
  const { translate } = useInternationalization()
  const { currentOrganization } = useCurrentUserInfosVar()
  const editDialogRef = useRef<EditWebhookDialogRef>(null)
  const deleleDialogRef = useRef<DeleteWebhookDialogRef>(null)
  const { data, loading } = useWehbookSettingQuery()
  const resultCurrentOrga = data?.currentUser.organizations?.find(
    (orga) => orga.id === currentOrganization?.id
  )
  const webhookUrl = resultCurrentOrga ? resultCurrentOrga?.webhookUrl : undefined

  return (
    <Page>
      <Typography variant="headline">{translate('text_6271200984178801ba8bdef2')}</Typography>
      <Subtitle>{translate('text_6271200984178801ba8bdf06')}</Subtitle>
      <Head>
        <Typography variant="subhead" color="grey700">
          {translate('text_6271200984178801ba8bdf40')}
        </Typography>
        <Button
          disabled={!!webhookUrl}
          variant="quaternary"
          onClick={editDialogRef?.current?.openDialog}
        >
          {translate('text_6271200984178801ba8bdf1a')}
        </Button>
      </Head>

      {!webhookUrl && !loading ? (
        <EmptyText variant="caption" color="grey600">
          {translate('text_62ce85fb3fb6842020331d85')}
        </EmptyText>
      ) : (
        <WebhookItem>
          {loading ? (
            <>
              <LeftBlock>
                <Skeleton variant="connectorAvatar" size="medium" />
                <Skeleton variant="text" width={240} height={12} />
              </LeftBlock>
              <RightSkeleton variant="text" width={160} height={12} />
            </>
          ) : (
            <>
              <LeftBlock>
                <Avatar variant="connector">
                  <Icon color="dark" name="globe" />
                </Avatar>
                <Typography variant="body" color="grey700" noWrap>
                  {webhookUrl}
                </Typography>
              </LeftBlock>
              <RightBlock>
                <Popper
                  PopperProps={{ placement: 'bottom-end' }}
                  opener={({ isOpen }) => (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                    <div>
                      <Tooltip
                        placement="top-end"
                        disableHoverListener={isOpen}
                        title={translate('text_6271200984178801ba8bdf8f')}
                      >
                        <Button icon="dots-horizontal" variant="quaternary" />
                      </Tooltip>
                    </div>
                  )}
                >
                  {({ closePopper }) => (
                    <MenuPopper>
                      <Button
                        startIcon="pen"
                        variant="quaternary"
                        align="left"
                        onClick={() => {
                          editDialogRef.current?.openDialog()
                          closePopper()
                        }}
                      >
                        {translate('text_6271200984178801ba8bdf88')}
                      </Button>
                      <Button
                        startIcon="trash"
                        variant="quaternary"
                        align="left"
                        onClick={() => {
                          deleleDialogRef.current?.openDialog()
                          closePopper()
                        }}
                      >
                        {translate('text_6271200984178801ba8bdf8e')}
                      </Button>
                    </MenuPopper>
                  )}
                </Popper>
              </RightBlock>
            </>
          )}
        </WebhookItem>
      )}
      <EditWebhookDialog ref={editDialogRef} webhook={webhookUrl} />
      <DeleteWebhookDialog ref={deleleDialogRef} />
    </Page>
  )
}

const Page = styled.div`
  padding: ${theme.spacing(8)} ${theme.spacing(12)};
  max-width: ${theme.spacing(168)};

  > *:first-child {
    margin-bottom: ${theme.spacing(1)};
  }
`

const Subtitle = styled(Typography)`
  margin-bottom: ${theme.spacing(8)};
`

const Head = styled.div`
  height: ${NAV_HEIGHT}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const EmptyText = styled(Typography)`
  padding-bottom: ${theme.spacing(8)};
  box-shadow: ${theme.shadows[7]};
`

const WebhookItem = styled.div`
  height: ${NAV_HEIGHT}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${theme.shadows[7]};
`

const LeftBlock = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  margin-right: ${theme.spacing(4)};

  > *:first-child {
    margin-right: ${theme.spacing(3)};
  }
`

const RightBlock = styled.div`
  display: flex;
  align-items: center;

  > *:first-child {
    margin-right: ${theme.spacing(6)};
  }
`

const RightSkeleton = styled(Skeleton)`
  margin-right: ${theme.spacing(16)};
`

export default Webhook
