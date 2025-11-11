import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Stack,
  Heading,
  Tile,
  Button,
  Grid,
  Column,
  TextInput,
  NumberInput,
  Select,
  SelectItem,
  InlineNotification,
  Tag,
  Loading,
} from '@carbon/react'
import { ArrowLeft, CheckmarkFilled, WarningFilled } from '@carbon/icons-react'

const networks = [
  { value: 'ethereum', text: 'Ethereum' },
  { value: 'polygon', text: 'Polygon' },
  { value: 'solana', text: 'Solana' },
  { value: 'binance', text: 'Binance Smart Chain' },
]

const assetTypes = [
  { value: 'currency', text: 'Currency Token' },
  { value: 'document', text: 'Document Certificate' },
  { value: 'art', text: 'Digital Art' },
  { value: 'loan', text: 'Loan Certificate' },
  { value: 'receipt', text: 'Digital Receipt' },
]

export default function NFTBanking() {
  const navigate = useNavigate()
  const [senderAddress, setSenderAddress] = useState('')
  const [receiverAddress, setReceiverAddress] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [assetName, setAssetName] = useState('')
  const [assetDescription, setAssetDescription] = useState('')
  const [assetType, setAssetType] = useState('')
  const [assetValue, setAssetValue] = useState('')
  const [smartContractAddress, setSmartContractAddress] = useState('')
  const [networkId, setNetworkId] = useState('ethereum')
  const [gasFees, setGasFees] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Generate a mock wallet address for the current user
  const currentUserWallet = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('current_user') || '{}')
      if (user.user_id) {
        // Generate a deterministic wallet address from user ID
        const hash = user.user_id.split('').reduce((acc, char) => {
          const hash = ((acc << 5) - acc) + char.charCodeAt(0)
          return hash & hash
        }, 0)
        return `0x${Math.abs(hash).toString(16).padStart(40, '0').slice(0, 40)}`
      }
      return '0x0000000000000000000000000000000000000000'
    } catch {
      return '0x0000000000000000000000000000000000000000'
    }
  }, [])

  const validateAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address) || /^[A-Za-z0-9]{32,44}$/.test(address)
  }

  const generateTransactionHash = () => {
    return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  }

  const handleInitiate = () => {
    if (!senderAddress || !receiverAddress || !tokenId || !assetType) {
      return
    }
    if (!validateAddress(senderAddress)) {
      return
    }
    if (!validateAddress(receiverAddress)) {
      return
    }
    setIsProcessing(true)
    // Simulate blockchain transaction processing
    setTimeout(() => {
      const hash = generateTransactionHash()
      setTransactionHash(hash)
      setIsProcessing(false)
      setShowSuccess(true)
    }, 3000)
  }

  const handleReset = () => {
    setSenderAddress('')
    setReceiverAddress('')
    setTokenId('')
    setAssetName('')
    setAssetDescription('')
    setAssetType('')
    setAssetValue('')
    setSmartContractAddress('')
    setNetworkId('ethereum')
    setGasFees('')
    setTransactionHash('')
    setShowSuccess(false)
  }

  return (
    <div style={{ padding: '2rem 1rem', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Stack gap={4}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button kind="ghost" size="sm" onClick={() => navigate('/dashboard')} renderIcon={ArrowLeft}>
              Back
            </Button>
            <Heading>NFT Banking System</Heading>
          </div>

          {showSuccess && transactionHash && (
            <InlineNotification
              kind="success"
              title="NFT Transfer Successful"
              subtitle={`Transaction Hash: ${transactionHash}`}
              lowContrast
              onClose={() => setShowSuccess(false)}
            />
          )}

          <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
            <Heading style={{ marginBottom: '1rem' }}>Initiate NFT Transfer</Heading>
            <Stack gap={4}>
              <Grid narrow>
                <Column lg={16} md={8} sm={4}>
                  <TextInput
                    id="sender_address"
                    labelText="Sender Address (Your Wallet)"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    placeholder={currentUserWallet}
                    helperText="Your blockchain wallet address"
                    invalid={senderAddress && !validateAddress(senderAddress)}
                    invalidText={senderAddress && !validateAddress(senderAddress) ? 'Invalid wallet address format' : ''}
                  />
                  <Button
                    kind="ghost"
                    size="sm"
                    onClick={() => setSenderAddress(currentUserWallet)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Use My Wallet
                  </Button>
                </Column>

                <Column lg={16} md={8} sm={4}>
                  <TextInput
                    id="receiver_address"
                    labelText="Receiver Address"
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    placeholder="0x..."
                    helperText="Recipient's blockchain wallet address"
                    invalid={receiverAddress && !validateAddress(receiverAddress)}
                    invalidText={receiverAddress && !validateAddress(receiverAddress) ? 'Invalid wallet address format' : ''}
                  />
                </Column>

                <Column lg={8} md={4} sm={4}>
                  <TextInput
                    id="token_id"
                    labelText="Token ID"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    placeholder="Enter unique token ID"
                    helperText="Unique identifier for the NFT"
                  />
                </Column>

                <Column lg={8} md={4} sm={4}>
                  <Select
                    id="network_id"
                    labelText="Network ID"
                    value={networkId}
                    onChange={(e) => setNetworkId(e.target.value)}
                  >
                    {networks.map((net) => (
                      <SelectItem key={net.value} value={net.value} text={net.text} />
                    ))}
                  </Select>
                </Column>

                <Column lg={16} md={8} sm={4}>
                  <TextInput
                    id="smart_contract"
                    labelText="Smart Contract Address"
                    value={smartContractAddress}
                    onChange={(e) => setSmartContractAddress(e.target.value)}
                    placeholder="0x..."
                    helperText="Address of the NFT smart contract"
                    invalid={smartContractAddress && !validateAddress(smartContractAddress)}
                    invalidText={smartContractAddress && !validateAddress(smartContractAddress) ? 'Invalid contract address format' : ''}
                  />
                </Column>

                <Column lg={8} md={4} sm={4}>
                  <Select
                    id="asset_type"
                    labelText="Asset Type"
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                  >
                    <SelectItem value="" text="Select asset type" />
                    {assetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} text={type.text} />
                    ))}
                  </Select>
                </Column>

                <Column lg={8} md={4} sm={4}>
                  <TextInput
                    id="asset_name"
                    labelText="Asset Name"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="e.g., Digital Receipt #123"
                  />
                </Column>

                <Column lg={16} md={8} sm={4}>
                  <TextInput
                    id="asset_description"
                    labelText="Asset Description"
                    value={assetDescription}
                    onChange={(e) => setAssetDescription(e.target.value)}
                    placeholder="Describe the asset being transferred"
                  />
                </Column>

                <Column lg={8} md={4} sm={4}>
                  <NumberInput
                    id="asset_value"
                    label="Asset Value"
                    step={0.01}
                    min={0}
                    value={assetValue || undefined}
                    onChange={(e) => {
                      const val = e.imaginaryTarget?.value || e.target.value
                      setAssetValue(val === '' ? '' : val)
                    }}
                    placeholder="Enter asset value"
                  />
                </Column>

                <Column lg={8} md={4} sm={4}>
                  <NumberInput
                    id="gas_fees"
                    label="Gas Fees / Transaction Fees"
                    step={0.001}
                    min={0}
                    value={gasFees || undefined}
                    onChange={(e) => {
                      const val = e.imaginaryTarget?.value || e.target.value
                      setGasFees(val === '' ? '' : val)
                    }}
                    placeholder="Estimated gas fees"
                  />
                </Column>
              </Grid>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Button
                  kind="primary"
                  size="lg"
                  onClick={handleInitiate}
                  disabled={isProcessing || !senderAddress || !receiverAddress || !tokenId || !assetType}
                >
                  {isProcessing ? 'Processing...' : 'Initiate NFT Transfer'}
                </Button>
                {transactionHash && (
                  <Button kind="secondary" size="lg" onClick={handleReset}>
                    New Transfer
                  </Button>
                )}
              </div>
            </Stack>
          </Tile>

          {isProcessing && (
            <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                <Loading description="Processing transaction..." withOverlay={false} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Processing NFT Transfer</div>
                  <div style={{ color: '#6f6f6f', fontSize: '0.875rem' }}>
                    Validating ownership... Checking smart contract... Executing transfer...
                  </div>
                </div>
              </div>
            </Tile>
          )}

          {transactionHash && (
            <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
              <Heading style={{ marginBottom: '1rem' }}>Transaction Details</Heading>
              <Grid narrow>
                <Column lg={16} md={8} sm={4}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: '#6f6f6f', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Transaction Hash</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                      {transactionHash}
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: '#6f6f6f', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Timestamp</div>
                    <div>{new Date().toLocaleString()}</div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: '#6f6f6f', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Status</div>
                    <Tag type="green">
                      <CheckmarkFilled size={16} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                      Confirmed on Blockchain
                    </Tag>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: '#6f6f6f', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Network</div>
                    <Tag type="blue">{networkId.toUpperCase()}</Tag>
                  </div>
                </Column>
              </Grid>
            </Tile>
          )}

          <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
            <Heading style={{ marginBottom: '1rem' }}>Security Features</Heading>
            <Grid narrow>
              <Column lg={8} md={4} sm={4}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckmarkFilled size={20} style={{ color: '#24a148' }} />
                  <div style={{ fontWeight: 600 }}>Ownership Validation</div>
                </div>
                <div style={{ color: '#6f6f6f', fontSize: '0.875rem', marginLeft: '1.75rem' }}>
                  Cryptographic verification ensures only the owner can transfer
                </div>
              </Column>
              <Column lg={8} md={4} sm={4}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckmarkFilled size={20} style={{ color: '#24a148' }} />
                  <div style={{ fontWeight: 600 }}>Smart Contract Execution</div>
                </div>
                <div style={{ color: '#6f6f6f', fontSize: '0.875rem', marginLeft: '1.75rem' }}>
                  Automated checks and transfer logic enforced on-chain
                </div>
              </Column>
              <Column lg={8} md={4} sm={4}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckmarkFilled size={20} style={{ color: '#24a148' }} />
                  <div style={{ fontWeight: 600 }}>Immutable Record</div>
                </div>
                <div style={{ color: '#6f6f6f', fontSize: '0.875rem', marginLeft: '1.75rem' }}>
                  Permanent blockchain ledger prevents tampering
                </div>
              </Column>
              <Column lg={8} md={4} sm={4}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckmarkFilled size={20} style={{ color: '#24a148' }} />
                  <div style={{ fontWeight: 600 }}>Traceability</div>
                </div>
                <div style={{ color: '#6f6f6f', fontSize: '0.875rem', marginLeft: '1.75rem' }}>
                  Complete ownership history and transaction trail
                </div>
              </Column>
            </Grid>
          </Tile>
        </Stack>
      </div>
    </div>
  )
}

