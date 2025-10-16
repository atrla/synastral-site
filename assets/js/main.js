// Swup: simple fade between pages
const swup = new Swup({
  animationSelector: '[data-swup="container"]'
})

// ---------- Filters ----------
function initFilters(){
  const grid = document.querySelector('.grid')
  if(!grid) return

  const cards = Array.from(grid.querySelectorAll('.card'))
  const countEl = document.querySelector('[data-count]')

  // state per group
  const state = {
    collection: new Set(['all']),
    sign: new Set(['all']),
  }

  // handle toggle clicks
  document.querySelectorAll('.filters-toggles').forEach(groupEl=>{
    const group = groupEl.getAttribute('data-filter-group')
    groupEl.addEventListener('click', (e)=>{
      const btn = e.target.closest('.toggle')
      if(!btn) return
      const val = btn.getAttribute('data-value')

      // toggle logic
      const set = state[group]
      const isAll = val === 'all'

      if(isAll){
        // reset this group to only 'all'
        set.clear(); set.add('all')
        groupEl.querySelectorAll('.toggle').forEach(b=>b.classList.remove('is-active'))
        groupEl.querySelector('.toggle[data-value="all"]').classList.add('is-active')
      } else {
        // if 'all' was active, remove it then add selection
        if(set.has('all')) set.delete('all')
        // toggle membership
        if(set.has(val)){ set.delete(val); btn.classList.remove('is-active') }
        else { set.add(val); btn.classList.add('is-active') }

        // if none selected, fall back to 'all'
        if(set.size === 0){
          set.add('all')
          groupEl.querySelector('.toggle[data-value="all"]').classList.add('is-active')
        } else {
          groupEl.querySelector('.toggle[data-value="all"]').classList.remove('is-active')
        }
      }

      // when user selects any non-all, mark it active visually
      if(!isAll) btn.classList.toggle('is-active')

      applyFilters()
    })
  })

  // Clear all
  const clearBtn = document.querySelector('[data-clear]')
  if(clearBtn){
    clearBtn.addEventListener('click', ()=>{
      ['collection','sign'].forEach(group=>{
        state[group].clear(); state[group].add('all')
        const el = document.querySelector(`.filters-toggles[data-filter-group="${group}"]`)
        el.querySelectorAll('.toggle').forEach(b=>b.classList.remove('is-active'))
        el.querySelector('.toggle[data-value="all"]').classList.add('is-active')
      })
      applyFilters()
    })
  }

  function matchesGroup(card, group, set){
    const attr = card.getAttribute(`data-${group}`) || ''
    if(set.has('all')) return true
    // multi-select: pass if any of the selected values equals the attr
    for(const v of set){ if(attr === v) return true }
    return false
  }

  function applyFilters(){
    let visible = 0
    cards.forEach(card=>{
      const pass =
        matchesGroup(card, 'collection', state.collection) &&
        matchesGroup(card, 'sign', state.sign)

      card.classList.toggle('is-hidden', !pass)
      if(pass) visible++
    })
    if(countEl) countEl.textContent = String(visible)
  }

  // initial count
  applyFilters()
}

// Run after Swup swaps content
initFilters()
if (window.swup){
  window.swup.on('contentReplaced', initFilters)
}


// Add state classes for transitions
document.documentElement.classList.remove('is-initial')
swup.on('willReplaceContent', () => document.documentElement.classList.add('is-leaving'))
swup.on('contentReplaced', () => {
  document.documentElement.classList.remove('is-leaving')
  document.documentElement.classList.add('is-rendering')
  // allow CSS to animate in
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('is-rendering')
  })
})
