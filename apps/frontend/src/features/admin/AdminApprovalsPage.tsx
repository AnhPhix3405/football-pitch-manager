import { CheckOutlined, CloseOutlined, EyeOutlined, FileTextOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Descriptions, Drawer, Input, Modal, Segmented, Table, Tag, message } from 'antd'
import { useMemo, useState } from 'react'
import { approvalRequests, type ApprovalRequest } from './admin.data'
import { mapOwnerApprovalToRequest, useAdminApprovals } from './hooks/useAdminApprovals'

export function AdminApprovalsPage() {
  const [type, setType] = useState<'owner' | 'field'>('owner')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ApprovalRequest>()
  const [resolved, setResolved] = useState<string[]>([])
  const [messageApi, contextHolder] = message.useMessage()

  const { apiApprovals, loading, refetch, approve, reject } = useAdminApprovals(type, query)

  const mappedApiRequests: ApprovalRequest[] = useMemo(() => {
    if (type !== 'owner' || apiApprovals.length === 0) return []
    return apiApprovals.map(mapOwnerApprovalToRequest)
  }, [apiApprovals, type])

  const visible = useMemo(() => {
    const source = mappedApiRequests.length > 0 ? mappedApiRequests : approvalRequests
    return source.filter(
      (item) =>
        item.type === type &&
        !resolved.includes(item.id) &&
        (!query || `${item.name} ${item.applicant} ${item.id}`.toLowerCase().includes(query.toLowerCase())),
    )
  }, [mappedApiRequests, query, resolved, type])

  const decide = (request: ApprovalRequest, isApproved: boolean) =>
    Modal.confirm({
      title: isApproved ? `Phê duyệt ${request.name}?` : `Từ chối ${request.name}?`,
      content: isApproved
        ? 'Tài khoản hoặc sân sẽ được kích hoạt trên hệ thống.'
        : 'Người gửi sẽ nhận thông báo và lý do từ chối.',
      okText: isApproved ? 'Phê duyệt' : 'Từ chối',
      okButtonProps: { danger: !isApproved },
      onOk: async () => {
        try {
          if (request.type === 'owner') {
            if (isApproved) {
              await approve(request.id, 'Hồ sơ đã được phê duyệt')
            } else {
              await reject(request.id, 'Hồ sơ chưa đạt yêu cầu xác minh')
            }
          }
          setResolved((items) => [...items, request.id])
          setSelected(undefined)
          messageApi.success(isApproved ? 'Đã phê duyệt hồ sơ.' : 'Đã từ chối hồ sơ.')
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : 'Thao tác không thành công.')
        }
      },
    })

  return (
    <section className="admin-page">
      {contextHolder}
      <header className="user-page__head">
        <div>
          <span className="eyebrow">VERIFICATION QUEUE</span>
          <h1>Phê duyệt chủ sân & sân</h1>
          <p>Kiểm tra hồ sơ, tài liệu và mức độ rủi ro trước khi kích hoạt.</p>
        </div>
      </header>
      <div className="admin-toolbar">
        <Segmented
          value={type}
          onChange={(val) => setType(val as 'owner' | 'field')}
          options={[
            { value: 'owner', label: 'Chủ sân chờ duyệt' },
            { value: 'field', label: 'Sân chờ duyệt' },
          ]}
        />
        <Input
          prefix={<SearchOutlined />}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm hồ sơ..."
        />
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={loading}>
          Làm mới
        </Button>
      </div>
      <Table
        loading={loading}
        rowKey="id"
        dataSource={visible}
        columns={[
          { title: 'TÊN ĐỐI TÁC / SÂN', dataIndex: 'name', render: (val, record) => <div><b>{val}</b><br /><small>{record.applicant}</small></div> },
          { title: 'KHU VỰC / TÀI KHOẢN', dataIndex: 'location' },
          { title: 'NGÀY NỘP', dataIndex: 'submittedAt' },
          { title: 'TÀI LIỆU', dataIndex: 'documents', render: (val) => <span><FileTextOutlined /> {val} file</span> },
          { title: 'MỨC ĐỘ RỦI RO', dataIndex: 'risk', render: (val) => <Tag color={val === 'low' ? 'green' : 'orange'}>{val?.toUpperCase()}</Tag> },
          {
            title: 'THAO TÁC',
            render: (_, record) => (
              <div style={{ display: 'flex', gap: 6 }}>
                <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(record)}>Xem</Button>
                <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => decide(record, true)}>Duyệt</Button>
                <Button size="small" danger icon={<CloseOutlined />} onClick={() => decide(record, false)}>Từ chối</Button>
              </div>
            ),
          },
        ]}
      />
      <Drawer title="Chi tiết hồ sơ phê duyệt" open={Boolean(selected)} onClose={() => setSelected(undefined)} width={500}>
        {selected && (
          <div className="approval-detail">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Mã hồ sơ">{selected.id}</Descriptions.Item>
              <Descriptions.Item label="Tên đối tác">{selected.name}</Descriptions.Item>
              <Descriptions.Item label="Email liên hệ">{selected.applicant}</Descriptions.Item>
              <Descriptions.Item label="Khu vực">{selected.location}</Descriptions.Item>
              <Descriptions.Item label="Ngày nộp">{selected.submittedAt}</Descriptions.Item>
              <Descriptions.Item label="Tài liệu đính kèm">{selected.documents} tài liệu (GPKD/Giấy tờ sân)</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{selected.status}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Button type="primary" block icon={<CheckOutlined />} onClick={() => decide(selected, true)}>Phê duyệt hồ sơ</Button>
              <Button danger block icon={<CloseOutlined />} onClick={() => decide(selected, false)}>Từ chối</Button>
            </div>
          </div>
        )}
      </Drawer>
    </section>
  )
}
