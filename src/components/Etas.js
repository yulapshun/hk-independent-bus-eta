import { useContext, useEffect, useState } from 'react'
import { fetchEtas } from 'hk-bus-eta'
import AppContext from '../AppContext'

export const useEtas = (routeId) => {
  const { db: {routeList}, isVisible } = useContext ( AppContext )
  const [ routeNo, serviceType ] = routeId.split('-')
  const [ routeKey, seq ] = routeId.split('/')
  const { co, stops, bound, nlbId } = routeList[routeKey] || DefaultRoute
  const [ etas, setEtas ] = useState(null)

  useEffect(() => {
    let isMounted = true
    
    const fetchData = () => {
      if ( !isVisible || navigator.userAgent === 'prerendering' ){
        // skip if prerendering
        setEtas(null)
        return new Promise((resolve) => resolve())
      }
      return fetchEtas({
        route: routeNo, routeStops: stops, seq: parseInt(seq, 10), bound, serviceType, co, nlbId
      }).then ( _etas => {
        if (isMounted) setEtas(_etas)
      })
    }
    
    const fetchEtaInterval = setInterval(() => {
      fetchData()
    }, 30000)

    fetchData()

    return () => {
      isMounted = false
      clearInterval(fetchEtaInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible])

  return etas
}

const DefaultRoute = { co: [''], stops: {'': ['']}, dest: {zh: '', en: ''}, bound: '', nlbId: 0, fares: [], faresHoliday: [] }