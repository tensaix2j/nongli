import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Solar } from 'lunar-javascript'
import './styles.css'

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

function pad(value) { return String(value).padStart(2, '0') }

function solarFromDate(date) {
  return Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

function getPillars(date) {
  const lunar = solarFromDate(date).getLunar()
  const lunarMonth = lunar.getMonthInChinese()
  return {
    lunar,
    yearGanZhi: lunar.getYearInGanZhi(),
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi(),
    lunarDay: lunar.getDayInChinese(),
    lunarMonth: lunarMonth.endsWith('月') ? lunarMonth : `${lunarMonth}月`,
    jieQi: lunar.getJieQi() || '',
  }
}

function formatDate(date) {
  return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日`
}

function App() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(today)

  const days = useMemo(() => {
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const start = new Date(firstDay)
    start.setDate(1 - firstDay.getDay())
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return date
    })
  }, [viewDate])

  const selectedInfo = getPillars(selectedDate)
  const isToday = (date) => date.toDateString() === today.toDateString()
  const isSelected = (date) => date.toDateString() === selectedDate.toDateString()
  const changeMonth = (amount) => {
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + amount, 1)
    setViewDate(nextMonth)
    setSelectedDate(nextMonth)
  }
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') changeMonth(-1)
      if (event.key === 'ArrowRight') changeMonth(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })
  const goToday = () => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(today) }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">曆</span><div><strong>农历</strong><span>CHINESE CALENDAR</span></div></div>
        <button className="today-button" onClick={goToday}>回到今天 <span>⌘ T</span></button>
      </header>

      <section className="intro">
        <div><p className="eyebrow">传统历法 · 现代视界</p><h1>时间的另一种<br /><em>秩序</em></h1></div>
        <p className="intro-copy">在公历之上，探索农历的节奏。<br />每一天，都有它独特的天干地支。</p>
      </section>

      <section className="calendar-card">
        <div className="calendar-toolbar">
          <div className="month-title"><span>{viewDate.getFullYear()}</span><strong>{monthNames[viewDate.getMonth()]}</strong></div>
          <div className="month-actions"><button aria-label="上个月" onClick={() => changeMonth(-1)}>←</button><button aria-label="下个月" onClick={() => changeMonth(1)}>→</button></div>
        </div>
        <div className="weekday-row">{weekLabels.map((label, index) => <div key={label} className={index === 0 || index === 6 ? 'weekend' : ''}>{label}</div>)}</div>
        <div className="calendar-grid">
          {days.map((date) => {
            const info = getPillars(date)
            const outside = date.getMonth() !== viewDate.getMonth()
            return <button key={date.toISOString()} className={`day-cell ${outside ? 'outside' : ''} ${isSelected(date) ? 'selected' : ''} ${isToday(date) ? 'today' : ''}`} onClick={() => setSelectedDate(date)}>
              <span className="gregorian">{date.getDate()}</span>
              <span className="lunar-date">{info.lunarDay === '初一' ? info.lunarMonth : info.lunarDay}</span>
              <span className="pillars"><b>{info.monthGanZhi}</b><b>{info.dayGanZhi}</b></span>
              {info.jieQi && <span className="jieqi">{info.jieQi}</span>}
            </button>
          })}
        </div>
        <div className="legend"><span><i className="dot red" />今日</span><span><i className="dot dark" />已选日期</span><span>天干地支 · 月 / 日</span></div>
      </section>

      <aside className="detail-card">
        <div className="detail-date"><span>{selectedDate.getFullYear()}</span><strong>{pad(selectedDate.getMonth() + 1)} / {pad(selectedDate.getDate())}</strong><span>{weekLabels[selectedDate.getDay()]}曜日</span></div>
        <div className="detail-main"><p className="eyebrow">{formatDate(selectedDate)}</p><h2>{selectedInfo.lunarMonth} · {selectedInfo.lunarDay}</h2><p className="muted">{selectedInfo.jieQi || '四季流转，岁月有常'}</p></div>
        <div className="pillars-large"><div><span>年柱</span><strong>{selectedInfo.yearGanZhi}</strong></div><div><span>月柱</span><strong>{selectedInfo.monthGanZhi}</strong></div><div><span>日柱</span><strong>{selectedInfo.dayGanZhi}</strong></div></div>
        <div className="detail-footer"><span>农历 · lunar-javascript</span><span>☼ 东八区</span></div>
      </aside>
      <footer>天行健，君子以自强不息 <span>·</span> 记下每一个值得的日子</footer>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
