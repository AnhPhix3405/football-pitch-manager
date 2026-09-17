import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from '../features/auth/AuthPage'
import { AdminApprovalsPage } from '../features/admin/AdminApprovalsPage'
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage'
import { AdminManagementPage } from '../features/admin/AdminManagementPage'
import { AdminReportsPage } from '../features/admin/AdminReportsPage'
import { MyBookingsPage } from '../features/bookings/MyBookingsPage'
import { MessagesPage } from '../features/chat/MessagesPage'
import { FieldDetailPage } from '../features/fields/FieldDetailPage'
import { FieldDiscoveryPage } from '../features/fields/FieldDiscoveryPage'
import { HomePage } from '../features/home/HomePage'
import { OwnerBookingDetailPage } from '../features/owner/OwnerBookingDetailPage'
import { OwnerBookingsPage } from '../features/owner/OwnerBookingsPage'
import { OwnerDashboardPage } from '../features/owner/OwnerDashboardPage'
import { OwnerFieldFormPage } from '../features/owner/OwnerFieldFormPage'
import { OwnerFieldsPage } from '../features/owner/OwnerFieldsPage'
import { OwnerRegistrationPage } from '../features/owner/OwnerRegistrationPage'
import { OwnerServicesPage } from '../features/owner/OwnerServicesPage'
import { OwnerSubscriptionPage } from '../features/owner/OwnerSubscriptionPage'
import { MyPostsPage } from '../features/posts/MyPostsPage'
import { OpponentDiscoveryPage } from '../features/posts/OpponentDiscoveryPage'
import { PostDetailPage } from '../features/posts/PostDetailPage'
import { ProfileSettingsPage } from '../features/profile/ProfileSettingsPage'
import { AdminLayout } from './layouts/AdminLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { OwnerLayout } from './layouts/OwnerLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { ProtectedRoute, RoleRoute } from './guards'

export function AppRouter() {
  return <BrowserRouter><Routes>
    <Route path="/auth/:mode" element={<AuthPage />} />
    <Route element={<PublicLayout />}><Route index element={<HomePage />} /><Route path="fields" element={<FieldDiscoveryPage />} /><Route path="fields/:fieldId" element={<FieldDetailPage />} /><Route path="opponents" element={<OpponentDiscoveryPage />} /></Route>
    <Route element={<ProtectedRoute />}><Route path="app" element={<DashboardLayout />}><Route index element={<Navigate to="bookings" replace />} /><Route path="fields" element={<Navigate to="/fields" replace />} /><Route path="bookings" element={<MyBookingsPage />} /><Route path="opponents" element={<OpponentDiscoveryPage />} /><Route path="posts" element={<MyPostsPage />} /><Route path="posts/:postId" element={<PostDetailPage />} /><Route path="messages" element={<MessagesPage />} /><Route path="settings" element={<ProfileSettingsPage />} /><Route path="profile" element={<ProfileSettingsPage />} /></Route></Route>
    <Route element={<RoleRoute allowedRoles={['owner']} />}><Route path="owner" element={<OwnerLayout />}><Route index element={<OwnerDashboardPage />} /><Route path="fields" element={<OwnerFieldsPage />} /><Route path="fields/new" element={<OwnerFieldFormPage />} /><Route path="fields/:fieldId/edit" element={<OwnerFieldFormPage />} /><Route path="services" element={<OwnerServicesPage />} /><Route path="bookings" element={<OwnerBookingsPage />} /><Route path="bookings/:bookingId" element={<OwnerBookingDetailPage />} /><Route path="subscription" element={<OwnerSubscriptionPage />} /></Route></Route>
    <Route element={<RoleRoute allowedRoles={['admin']} />}><Route path="admin" element={<AdminLayout />}><Route index element={<AdminDashboardPage />} /><Route path="approvals" element={<AdminApprovalsPage />} /><Route path="management" element={<AdminManagementPage />} /><Route path="reports" element={<AdminReportsPage />} /></Route></Route>
    <Route path="owner/register" element={<OwnerRegistrationPage />} /><Route path="*" element={<Navigate to="/auth/login" replace />} />
  </Routes></BrowserRouter>
}
