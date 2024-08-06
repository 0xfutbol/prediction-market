'use client'

import React, { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Message } from '@locmod/intl'
import { useLive, useNavigation } from '@azuro-org/sdk'
import { type NavigationQuery } from '@azuro-org/toolkit'
import cx from 'classnames'
import { constants } from 'helpers'

import { Icon, type IconName } from 'components/ui'
import { Href } from 'components/navigation'
import { Flag } from 'components/dataDisplay'

import Skeleton from './components/Skeleton/Skeleton'

import messages from './messages'


type LeagueProps = NavigationQuery['sports'][0]['countries'][0]['leagues'][0] & {
  url: string
  country: {
    name: string
    slug: string
  }
}

const League: React.FC<LeagueProps> = (props) => {
  const { url, name, country, games, slug } = props

  const { countrySlug, leagueSlug } = useParams()

  const isActive = Boolean(leagueSlug) && countrySlug === country.slug && slug === leagueSlug

  const rootClassName = cx('flex items-center justify-between py-2 px-4 hover:text-grey-90', {
    'text-grey-60': !isActive,
    'text-grey-90': isActive,
  })

  return (
    <Href to={url} className={rootClassName}>
      <div className="flex items-center overflow-hidden">
        <Flag className="mr-2" country={country.slug} />
        <div className="text-caption-13 text-ellipsis whitespace-nowrap overflow-hidden">{name}</div>
      </div>
      <div className="bg-grey-10 px-1 py-px ml-2 text-caption-12">{games?.length || 0}</div>
    </Href>
  )
}

type Top = {
  slug: '/'
  name: Intl.Message
  gamesCount?: number
}

type SportProps = NavigationQuery['sports'][0] | Top

const Sport: React.FC<SportProps> = (props) => {
  const { slug, name, countries } = props as NavigationQuery['sports'][0]
  const { gamesCount } = props as Top

  const { sportSlug } = useParams()

  const isTop = slug === '/'
  const isActive = sportSlug === slug || isTop && !sportSlug

  const rootClassName = cx('p-px rounded-4 overflow-hidden', {
    'bg-card-border': isActive,
  })
  const wrapperClassName = cx({ 'bg-bg-l1 rounded-4': isActive })
  const buttonClassName = cx('group px-4 py-2 flex w-full items-center justify-between hover:text-brand-50', {
    'text-grey-60': !isActive,
    'text-brand-50': isActive,
  })
  const iconClassName = cx('h-4 w-4', {
    'rotate-180': isActive,
  })

  const leagues = useMemo(() => {
    if (!countries) {
      return
    }

    return countries.map(({ leagues, name, slug: countrySlug }) => {
      return leagues.map(league => ({
        url: `/${slug}/${countrySlug}/${league.slug}`,
        ...league,
        country: {
          name,
          slug: countrySlug,
        },
      }))
    }).flat()
  }, [ countries ])

  return (
    <div className={rootClassName}>
      <div className={wrapperClassName}>
        <Href to={`/${slug}`} className={buttonClassName}>
          <div className="flex items-center">
            {
              isTop ? (
                <>
                  <div className="flex items-center justify-center w-4 h-4 mr-2">
                    <div
                      className={
                        cx('w-[13px] h-[13px] rounded-full', {
                          'bg-grey-60': !isActive,
                          'bg-brand-50': isActive,
                        })
                      }
                    />
                  </div>
                  <Message className="text-caption-13" value={name} />
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4 mr-2" name={`sport/${slug}` as IconName} />
                  <div className="text-caption-13">{name}</div>
                </>
              )
            }
          </div>
          {
            isTop ? (
              <div className="text-caption-12">{gamesCount}</div>
            ) : (
              <Icon className={iconClassName} name="interface/chevron_down" />
            )
          }
        </Href>
        {
          Boolean(isActive && leagues) && (
            leagues?.map((league) => (
              <League key={`${league.country.slug}-${league.slug}`} {...league} />
            ))
          )
        }
      </div>
    </div>
  )
}

type NavigationProps = {
  className?: string
}

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const { isLive } = useLive()
  const { navigation, loading } = useNavigation({
    withGameCount: true,
    isLive,
  })

  const allTopGames = useMemo(() => {
    if (!navigation) {
      return
    }

    let result = 0

    Object.values(navigation).forEach(({ countries }) => {
      let gamesCount = 0

      countries.forEach(({ leagues }) => {
        gamesCount += leagues.reduce((acc, { games }) => acc + games!.length, 0)
      })


      result += Math.min(gamesCount, constants.topPageGamePerSportLimit)
    })

    return result
  }, [ navigation ])

  const sortedSports = useMemo(() => {
    if (!navigation) {
      return []
    }

    return [ ...navigation ].sort((sport1, sport2) => {
      if (!sport1.countries.length) {
        return 1
      }

      if (!sport2.countries.length) {
        return -1
      }

      return 0
    })
  }, [ navigation ])

  if (loading) {
    return <Skeleton />
  }

  return (
    <div className={className}>
      <Message className="text-caption-13 font-semibold py-2 px-4 mb-2" value={messages.title} tag="p" />
      <Sport slug="/" name={messages.top} gamesCount={allTopGames} />
      {
        sortedSports?.map(sport => (
          <Sport key={sport.slug} {...sport} />
        ))
      }
    </div>
  )
}

export default Navigation
