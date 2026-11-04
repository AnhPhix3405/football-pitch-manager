import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage'
import { AdminManagementPage } from '../features/admin/AdminManagementPage'
import { AdminReportsPage } from '../features/admin/AdminReportsPage'

function RedirectFieldDetail() {
  const { fieldId } = useParams()
  return <Navigate to={`/fields/${fieldId}`} replace />
}

function RedirectPostDetail() {
  const { postId } = useParams()
  return <Navigate to={`/posts/${postId}`} replace />
}
import { AuthPage } from '../features/auth/AuthPage'
import { AdminApprovalsPage } from '../features/admin/AdminApprovalsPage'
import { MyBookingsPage } from '../features/bookings/MyBookingsPage'
import { MessagesPage } from '../features/chat/MessagesPage'
import { FieldDetailPage } from '../features/fields/FieldDetailPage'
import { FieldDiscoveryPage } from '../features/fields/FieldDiscoveryPage'
import { HomePage } from '../features/home/HomePage'
import { OwnerBookingDetailPage } from '../features/owner/OwnerBookingDetailPage'
import { OwnerBookingsPage } from '../features/owner/OwnerBookingsPage'
import { OwnerCourtsPage } from '../features/owner/OwnerCourtsPage'
import { OwnerImagesPage } from '../features/owner/OwnerImagesPage'
import { OwnerOpeningHoursPage } from '../features/owner/OwnerOpeningHoursPage'
import { OwnerPricingPage } from '../features/owner/OwnerPricingPage'
import { OwnerDashboardPage } from '../features/owner/OwnerDashboardPage'
import { OwnerFieldFormPage } from '../features/owner/OwnerFieldFormPage'
import { OwnerFieldsPage } from '../features/owner/OwnerFieldsPage'
import { OwnerRegistrationPage } from '../features/owner/OwnerRegistrationPage'
import { OwnerServicesPage } from '../features/owner/OwnerServicesPage'
import { OwnerSubscriptionPage } from '../features/owner/OwnerSubscriptionPage'
import { OwnerTimelinePage } from '../features/owner/OwnerTimelinePage'
import { MyPostsPage } from '../features/posts/MyPostsPage'
import { OpponentDiscoveryPage } from '../features/posts/OpponentDiscoveryPage'
import { PostDetailPage } from '../features/posts/PostDetailPage'
import { ProfileSettingsPage } from '../features/profile/ProfileSettingsPage'
import { RankingPage } from '../features/rankings/RankingPage'
import { VNPayReturnPage } from '../features/payment/VNPayReturnPage'
import { AdminLayout } from './layouts/AdminLayout'
import { OwnerLayout } from './layouts/OwnerLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { ScrollToTop } from '../components/ScrollToTop'
import { ProtectedRoute, RoleRoute } from './guards'

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/auth/:mode" element={<AuthPage />} />

        {/* Public & User routes under the modern floating Navbar layout */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="fields" element={<FieldDiscoveryPage />} />
          <Route path="fields/:fieldId" element={<FieldDetailPage />} />
          <Route path="opponents" element={<OpponentDiscoveryPage />} />
          <Route path="rankings" element={<RankingPage />} />
          <Route path="posts" element={<MyPostsPage />} />
          <Route path="posts/:postId" element={<PostDetailPage />} />
          <Route path="payment/vnpay-return" element={<VNPayReturnPage />} />

          {/* Protected user routes with new Navbar layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="posts/new" element={<Navigate to="/opponents" replace />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<ProfileSettingsPage />} />
            <Route path="profile" element={<ProfileSettingsPage />} />
          </Route>
        </Route>

        {/* Backward-compatibility redirects for /app/* */}
        <Route path="app">
          <Route index element={<Navigate to="/fields" replace />} />
          <Route path="fields" element={<Navigate to="/fields" replace />} />
          <Route path="fields/:fieldId" element={<RedirectFieldDetail />} />
          <Route path="bookings" element={<Navigate to="/bookings" replace />} />
          <Route path="opponents" element={<Navigate to="/opponents" replace />} />
          <Route path="posts" element={<Navigate to="/posts" replace />} />
          <Route path="posts/:postId" element={<RedirectPostDetail />} />
          <Route path="messages" element={<Navigate to="/messages" replace />} />
          <Route path="settings" element={<Navigate to="/profile" replace />} />
          <Route path="profile" element={<Navigate to="/profile" replace />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={['owner']} />}>
          <Route path="owner" element={<OwnerLayout />}>
            <Route index element={<OwnerDashboardPage />} />
            <Route path="fields" element={<OwnerFieldsPage />} />
            <Route path="fields/new" element={<OwnerFieldFormPage />} />
            <Route path="fields/:fieldId/edit" element={<OwnerFieldFormPage />} />
            <Route path="fields/:fieldId/courts" element={<OwnerCourtsPage />} />
            <Route path="fields/:fieldId/images" element={<OwnerImagesPage />} />
            <Route path="fields/:fieldId/services" element={<OwnerServicesPage />} />
            <Route path="fields/:fieldId/opening-hours" element={<OwnerOpeningHoursPage />} />
            <Route path="fields/:fieldId/pricing" element={<OwnerPricingPage />} />
            <Route path="services" element={<OwnerServicesPage />} />
            <Route path="bookings" element={<OwnerBookingsPage />} />
            <Route path="bookings/:bookingId" element={<OwnerBookingDetailPage />} />
            <Route path="timeline" element={<OwnerTimelinePage />} />
            <Route path="subscription" element={<OwnerSubscriptionPage />} />
          </Route>
        </Route>
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="approvals" element={<Navigate to="/admin/approvals/owners" replace />} />
            <Route path="approvals/owners" element={<AdminApprovalsPage forcedType="owner" />} />
            <Route path="approvals/fields" element={<AdminApprovalsPage forcedType="field" />} />
            <Route path="management" element={<AdminManagementPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>
        </Route>
        <Route path="owner/register" element={<OwnerRegistrationPage />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
