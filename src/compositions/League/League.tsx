'use client'

import React from 'react'
import { type Sport } from 'hooks'
import cx from 'classnames'
import { useGameStatus, useLive } from '@azuro-org/sdk'
import { GameStatus } from '@azuro-org/toolkit'
import { Message } from '@locmod/intl'
import { getGameDateTime } from 'helpers/getters'

import { Flag, OpponentLogo } from 'components/dataDisplay'
import { Href } from 'components/navigation'
import { LiveDot } from 'components/ui'
import Markets, { MarketsSkeleton } from 'compositions/Markets/Markets'
import message from './message'


export const LeagueSkeleton: React.FC = () => {
  return (
    <div className="mt-1 first-of-type:mt-0">
      <div className="rounded-t-4 flex items-center justify-between py-2 px-4 bg-bg-l2 mb-[2px]">
        <div className="flex items-center">
          <div className="bone size-4 mr-2 rounded-full" />
          <div className="bone h-[0.875rem] w-[8rem] rounded-4" />
          <div className="size-1 rounded-full mx-2 bg-grey-20" />
          <div className="bone h-[0.875rem] w-[4rem] rounded-4" />
        </div>
      </div>
      <div className="space-y-[2px]">
        {
          new Array(3).fill(0).map((_, index) => (
            <div key={index} className="flex mb:flex-col ds:items-center justify-between py-2 px-4 bg-bg-l2 last-of-type:rounded-b-4">
              <div className="flex items-center">
                <div className="bone size-7 -mt-2 rounded-full" />
                <div className="bone size-7 -mb-2 -ml-2 z-20 rounded-full" />
                <div className="ml-3">
                  <div className="mb-[2px] flex items-center">
                    <div className="bone h-4 w-8 mr-1 rounded-4" />
                    <span className="bone h-[0.875rem] w-20 rounded-4" />
                  </div>
                  <div className="bone h-4 w-24 rounded-4" />
                </div>
              </div>
              <div className="w-full max-w-[26.25rem] mb:mt-2">
                <MarketsSkeleton />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

type GameProps = {
  className?: string
  leagueUrl: string
  game: Sport['leagues'][0]['games'][0]
}

const Game: React.FC<GameProps> = ({ className, leagueUrl, game }) => {
  const { gameId, title, participants, startsAt } = game
  const { date, time } = getGameDateTime(+startsAt * 1000)

  const { isLive } = useLive()
  const { status } = useGameStatus({
    graphStatus: game.status,
    startsAt: +game.startsAt,
    isGameExistInLive: isLive,
  })

  const isInLive = status === GameStatus.Live

  const rootClassName = cx('group flex mb:flex-col ds:items-center justify-between py-2 px-4 bg-bg-l2 last-of-type:rounded-b-4 relative', className)

  return (
    <div className={rootClassName}>
      {
        isInLive && (
          <div className="border-l-[2px] border-l-accent-red absolute h-full left-0 bg-live-game-shadow w-[30%] group-last-of-type:rounded-b-4" />
        )
      }
      <div className="flex items-center relative z-10">
        {
          participants.map(({ name, image }, index) => (
            <OpponentLogo className={cx({ '-mt-2': !index, '-mb-2 -ml-2 z-20': !!index })} key={name} image={image} />
          ))
        }
        <div className="ml-3">
          <div className="mb-[2px]">
            {
              isInLive ? (
                <div className="flex items-center">
                  <LiveDot className="mr-1" />
                  <Message className="text-accent-red text-caption-13 font-semibold" value={message.live} />
                </div>
              ) : (
                <>
                  <span className="text-caption-13 font-semibold text-grey-70 mr-1">{time}</span>
                  <span className="text-caption-12 text-grey-60">{date}</span>
                </>
              )
            }
          </div>
          <div className="text-caption-13 font-semibold">{title}</div>
        </div>
      </div>
      <div className="w-full max-w-[26.25rem] mb:mt-2">
        <Markets gameId={gameId} gameStatus={status} />
      </div>
    </div>
  )
}

type LeagueProps = {
  sportSlug: string
  league: Sport['leagues'][0]
}

const League: React.FC<LeagueProps> = ({ sportSlug, league }) => {
  const { slug, name, countryName, countrySlug, games } = league

  const leagueUrl = `/${sportSlug}/${countrySlug}/${slug}`

  return (
    <div className="mt-1 first-of-type:mt-0">
      <div className="rounded-t-4 flex items-center justify-between py-2 px-4 bg-bg-l2 mb-[2px]">
        <Href to={leagueUrl} className="flex items-center">
          <Flag className="mr-2" country={countrySlug} />
          <div className="text-caption-12 text-grey-70">{countryName}</div>
          <div className="size-1 rounded-full mx-2 bg-grey-20" />
          <div className="text-caption-12">{name}</div>
        </Href>
      </div>
      <div className="space-y-[2px]">
        {
          games.map(game => (
            <Game
              key={game.gameId}
              leagueUrl={leagueUrl}
              game={game}
            />
          ))
        }
      </div>
    </div>
  )
}

export default League
