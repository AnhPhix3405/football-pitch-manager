import { useMemo, useState } from 'react'
import {
  SearchOutlined,
  StarFilled,
  TrophyFilled,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Input, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RANKING_TABS } from './constants/ranking.constants'
import type {
  FieldRankingItem,
  PlayerRankingItem,
} from './interface/ranking.types'
import { useRankings } from '../../hooks/useRankings'

interface PodiumItem {
  name: string
  avatarUrl?: string | null
  subtitle: string
  scoreBadge: string
}

export function RankingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { activeTab, setActiveTab, playerRankings, fieldRankings, loading } =
    useRankings(RANKING_TABS.PLAYERS)

  const [searchQuery, setSearchQuery] = useState('')

  // Filter items by search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return playerRankings
    const q = searchQuery.toLowerCase()
    return playerRankings.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.district && p.district.toLowerCase().includes(q)) ||
        (p.skillLevel && p.skillLevel.toLowerCase().includes(q)),
    )
  }, [playerRankings, searchQuery])

  const filteredFields = useMemo(() => {
    if (!searchQuery.trim()) return fieldRankings
    const q = searchQuery.toLowerCase()
    return fieldRankings.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q),
    )
  }, [fieldRankings, searchQuery])

  const top3 = useMemo<{
    first: PodiumItem | null
    second: PodiumItem | null
    third: PodiumItem | null
  }>(() => {
    const toItem = (
      item?: PlayerRankingItem | FieldRankingItem,
      rankIndex = 0,
    ): PodiumItem | null => {
      if (!item) return null
      const rankLabels = [
        t('rankings.top1', { defaultValue: 'Top 1' }),
        t('rankings.top2', { defaultValue: 'Top 2' }),
        t('rankings.top3', { defaultValue: 'Top 3' }),
      ]
      const fallbackSubtitle = rankLabels[rankIndex] || 'Xếp hạng'

      if (activeTab === RANKING_TABS.PLAYERS) {
        const p = item as PlayerRankingItem
        const sub =
          p.district && p.district !== 'Chưa cập nhật'
            ? `${p.district} · ${fallbackSubtitle}`
            : fallbackSubtitle
        return {
          name: p.name,
          avatarUrl: p.avatarUrl,
          subtitle: sub,
          scoreBadge: p.avgRating.toFixed(1),
        }
      } else {
        const f = item as FieldRankingItem
        const sub =
          f.district && f.district !== 'Chưa cập nhật'
            ? `${f.district} · ${fallbackSubtitle}`
            : fallbackSubtitle
        return {
          name: f.name,
          avatarUrl: f.thumbnailUrl,
          subtitle: sub,
          scoreBadge: f.avgRating.toFixed(1),
        }
      }
    }

    const source =
      activeTab === RANKING_TABS.PLAYERS ? playerRankings : fieldRankings
    return {
      first: toItem(source[0], 0),
      second: toItem(source[1], 1),
      third: toItem(source[2], 2),
    }
  }, [activeTab, playerRankings, fieldRankings, t])

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <TrophyFilled className="text-amber-400" />
              {t('rankings.title', { defaultValue: 'Bảng Xếp Hạng' })}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              {t('rankings.subtitle', {
                defaultValue:
                  'Tôn vinh những cầu thủ fair-play mẫu mực và các cụm sân chất lượng hàng đầu.',
              })}
            </p>
          </div>

          <div className="w-full sm:w-72">
            <Input
              prefix={<SearchOutlined className="text-zinc-500 mr-2" />}
              placeholder={t('rankings.searchPlaceholder', {
                defaultValue: 'Tìm kiếm tên, khu vực...',
              })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="rounded-full bg-zinc-900/80 border-white/10 text-white placeholder-zinc-500 hover:border-lime-500/50 focus:border-lime-500 py-2 px-4 shadow-inner"
            />
          </div>
        </div>

        {/* Podium Banner (Top 3 Cards with Cosmic / Space Glow) */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 border border-white/10 bg-gradient-to-b from-[#181a26]/90 via-[#10121d]/90 to-[#0c0d14]/95 backdrop-blur-xl shadow-2xl">
          {/* Ambient Cosmic Orbs */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Podium Row */}
          <div className="relative z-10 flex flex-row items-end justify-center gap-3 sm:gap-6 pt-4 pb-2">
            {/* 2nd Place */}
            <div className="flex-1 max-w-[200px] sm:max-w-[230px] flex flex-col items-center">
              <div className="w-full rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center bg-gradient-to-b from-slate-700/40 via-slate-800/30 to-slate-900/40 border border-slate-500/30 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-1">
                {/* 2nd Badge */}
                <div className="relative flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-slate-700/70 border border-slate-400/40 flex items-center justify-center shadow-md">
                    <span className="text-xs font-black tracking-wider text-slate-200">
                      2<sup className="text-[9px]">nd</sup>
                    </span>
                  </div>
                </div>

                {/* Avatar */}
                <Avatar
                  src={top3.second?.avatarUrl || undefined}
                  icon={<UserOutlined />}
                  size={64}
                  className="border-2 border-slate-400/50 shadow-md mb-3"
                />

                <h4 className="text-sm font-bold text-white truncate w-full">
                  {top3.second?.name ||
                    t('rankings.emptySlot', { defaultValue: 'Đang cập nhật' })}
                </h4>
                <span className="text-xs text-zinc-400 truncate w-full mb-2">
                  {top3.second?.subtitle || 'Top 2'}
                </span>

                <div className="px-3 py-1 rounded-full bg-slate-700/50 border border-slate-500/30 text-xs font-semibold text-slate-200 flex items-center gap-1">
                  <StarFilled className="text-amber-400 text-[11px]" />
                  <span>{top3.second?.scoreBadge || '0.0'}</span>
                </div>
              </div>
            </div>

            {/* 1st Place (Elevated, taller, glowing gold) */}
            <div className="flex-1 max-w-[220px] sm:max-w-[260px] flex flex-col items-center -translate-y-4">
              <div className="w-full rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center bg-gradient-to-b from-amber-500/40 via-yellow-600/25 to-slate-900/50 border-2 border-amber-400/70 backdrop-blur-md shadow-2xl shadow-amber-500/20 transition-transform hover:-translate-y-1">
                {/* 1st Badge */}
                <div className="relative flex items-center justify-center mb-3">
                  <div className="w-14 h-14 rounded-full bg-amber-500/40 border-2 border-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <span className="text-sm font-black tracking-wider text-amber-200">
                      1<sup className="text-[10px]">st</sup>
                    </span>
                  </div>
                </div>

                {/* Avatar */}
                <Avatar
                  src={top3.first?.avatarUrl || undefined}
                  icon={<UserOutlined />}
                  size={76}
                  className="border-3 border-amber-400 shadow-xl mb-3"
                />

                <h4 className="text-base font-extrabold text-white truncate w-full">
                  {top3.first?.name ||
                    t('rankings.emptySlot', { defaultValue: 'Đang cập nhật' })}
                </h4>
                <span className="text-xs text-amber-300 font-medium truncate w-full mb-2">
                  {top3.first?.subtitle || 'Top 1'}
                </span>

                <div className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-sm">
                  <StarFilled className="text-amber-400 text-xs" />
                  <span>{top3.first?.scoreBadge || '0.0'}</span>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex-1 max-w-[200px] sm:max-w-[230px] flex flex-col items-center">
              <div className="w-full rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center bg-gradient-to-b from-amber-900/30 via-stone-800/30 to-stone-900/40 border border-amber-700/30 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-1">
                {/* 3rd Badge */}
                <div className="relative flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-amber-900/50 border border-amber-600/40 flex items-center justify-center shadow-md">
                    <span className="text-xs font-black tracking-wider text-amber-300">
                      3<sup className="text-[9px]">rd</sup>
                    </span>
                  </div>
                </div>

                {/* Avatar */}
                <Avatar
                  src={top3.third?.avatarUrl || undefined}
                  icon={<UserOutlined />}
                  size={64}
                  className="border-2 border-amber-600/50 shadow-md mb-3"
                />

                <h4 className="text-sm font-bold text-white truncate w-full">
                  {top3.third?.name ||
                    t('rankings.emptySlot', { defaultValue: 'Đang cập nhật' })}
                </h4>
                <span className="text-xs text-zinc-400 truncate w-full mb-2">
                  {top3.third?.subtitle || 'Top 3'}
                </span>

                <div className="px-3 py-1 rounded-full bg-amber-900/40 border border-amber-700/30 text-xs font-semibold text-amber-200 flex items-center gap-1">
                  <StarFilled className="text-amber-400 text-[11px]" />
                  <span>{top3.third?.scoreBadge || '0.0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Leaderboard Table */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          {/* Tabs Navigation Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center text-lg">
                <TrophyFilled />
              </div>
              <h3 className="text-xl font-bold text-white">
                {activeTab === RANKING_TABS.PLAYERS
                  ? t('rankings.topPlayers', {
                    defaultValue: 'Top Cầu Thủ Fair-Play',
                  })
                  : t('rankings.topFields', {
                    defaultValue: 'Top Sân Bóng Uy Tín',
                  })}
              </h3>
            </div>

            {/* Pill Tabs */}
            <div className="inline-flex p-1 rounded-full bg-zinc-900 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab(RANKING_TABS.PLAYERS)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === RANKING_TABS.PLAYERS
                  ? 'pill-btn--primary'
                  : 'text-zinc-400 hover:text-white'
                  }`}
              >
                {t('rankings.tabPlayers', {
                  defaultValue: 'Cầu thủ Fair-play',
                })}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(RANKING_TABS.FIELDS)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === RANKING_TABS.FIELDS
                  ? 'pill-btn--primary'
                  : 'text-zinc-400 hover:text-white'
                  }`}
              >
                {t('rankings.tabFields', { defaultValue: 'Sân bóng uy tín' })}
              </button>
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <Spin size="large" />
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase font-semibold text-zinc-500 tracking-wider">
                    <th className="py-4 px-4 w-16">
                      {t('rankings.colRank', { defaultValue: 'Hạng' })}
                    </th>
                    <th className="py-4 px-4">
                      {activeTab === RANKING_TABS.PLAYERS
                        ? t('rankings.colPlayer', { defaultValue: 'Cầu thủ' })
                        : t('rankings.colField', { defaultValue: 'Sân bóng' })}
                    </th>
                    <th className="py-4 px-4 hidden md:table-cell">
                      {t('rankings.colDistrict', {
                        defaultValue: 'Khu vực',
                      })}
                    </th>
                    <th className="py-4 px-4 text-center">
                      {t('rankings.colRating', { defaultValue: 'Đánh giá' })}
                    </th>
                    <th className="py-4 px-4 text-right">
                      {t('rankings.colAction', { defaultValue: 'Thao tác' })}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeTab === RANKING_TABS.PLAYERS
                    ? filteredPlayers.map((player) => (
                      <tr
                        key={player.userId}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Rank # */}
                        <td className="py-4 px-4 font-mono font-bold text-sm">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${player.rank === 1
                              ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : player.rank === 2
                                ? 'bg-slate-400/20 text-slate-200 font-extrabold'
                                : player.rank === 3
                                  ? 'bg-amber-700/20 text-amber-400 font-extrabold'
                                  : 'text-zinc-500'
                              }`}
                          >
                            #{String(player.rank).padStart(2, '0')}
                          </span>
                        </td>

                        {/* Player Info */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={player.avatarUrl || undefined}
                              icon={<UserOutlined />}
                              size={40}
                              className="border border-white/10 shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-semibold text-white group-hover:text-[#8cfc70] transition-colors text-sm">
                                {player.name}
                              </p>
                              <p className="text-xs text-zinc-500 md:hidden">
                                {player.district || 'Chưa cập nhật'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* District / Khu vực */}
                        <td className="py-4 px-4 hidden md:table-cell text-sm text-zinc-400">
                          <span className="px-3 py-1 rounded-md bg-zinc-900 border border-white/5 text-xs text-zinc-300">
                            {player.district || 'Chưa cập nhật'}
                          </span>
                        </td>

                        {/* Rating & Reviews */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/5 text-xs text-amber-400">
                            <StarFilled />
                            <span className="font-bold">
                              {player.avgRating.toFixed(1)}
                            </span>
                            <span className="text-zinc-500">
                              ({player.totalReviews})
                            </span>
                          </div>
                        </td>

                        {/* Action Button */}
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => navigate('/opponents')}
                            className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/5 text-zinc-300 hover:bg-[#8cfc70] hover:text-zinc-950 transition-all"
                          >
                            {t('rankings.btnInvite', {
                              defaultValue: 'Giao lưu',
                            })}
                          </button>
                        </td>
                      </tr>
                    ))
                    : filteredFields.map((field) => (
                      <tr
                        key={field.fieldId}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Rank # */}
                        <td className="py-4 px-4 font-mono font-bold text-sm">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${field.rank === 1
                              ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : field.rank === 2
                                ? 'bg-slate-400/20 text-slate-200 font-extrabold'
                                : field.rank === 3
                                  ? 'bg-amber-700/20 text-amber-400 font-extrabold'
                                  : 'text-zinc-500'
                              }`}
                          >
                            #{String(field.rank).padStart(2, '0')}
                          </span>
                        </td>

                        {/* Field Info */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={field.thumbnailUrl || undefined}
                              shape="square"
                              size={44}
                              className="border border-white/10 rounded-xl shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-semibold text-white group-hover:text-[#8cfc70] transition-colors text-sm">
                                {field.name}
                              </p>
                              <p className="text-xs text-zinc-500 truncate max-w-xs">
                                {field.address}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* District */}
                        <td className="py-4 px-4 hidden md:table-cell text-sm text-zinc-400">
                          <span className="px-3 py-1 rounded-md bg-zinc-900 border border-white/5 text-xs text-zinc-300">
                            {field.district || 'Chưa cập nhật'}
                          </span>
                        </td>

                        {/* Rating & Reviews */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/5 text-xs text-amber-400">
                            <StarFilled />
                            <span className="font-bold">
                              {field.avgRating.toFixed(1)}
                            </span>
                            <span className="text-zinc-500">
                              ({field.totalReviews})
                            </span>
                          </div>
                        </td>

                        {/* Action Button */}
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/fields/${field.fieldId}`)
                            }
                            className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/5 text-zinc-300 hover:bg-[#8cfc70] hover:text-zinc-950 transition-all"
                          >
                            {t('rankings.btnViewField', {
                              defaultValue: 'Xem sân',
                            })}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {((activeTab === RANKING_TABS.PLAYERS &&
                filteredPlayers.length === 0) ||
                (activeTab === RANKING_TABS.FIELDS &&
                  filteredFields.length === 0)) && (
                  <div className="py-16 text-center text-zinc-500 text-sm">
                    {t('rankings.noData', {
                      defaultValue: 'Chưa có dữ liệu xếp hạng phù hợp.',
                    })}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
