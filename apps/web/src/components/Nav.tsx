import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Nav() {
  return (
    <nav className="border-b border-border bg-card px-6 py-3">
      <div className="mx-auto max-w-6xl flex items-center gap-6">
        <span className="text-sm font-bold tracking-tight text-foreground">
          GolfOps
        </span>
        <NavLink
          to="/activities"
          className={({ isActive }) =>
            cn(
              'text-sm transition-colors',
              isActive
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          Activities
        </NavLink>
        <NavLink
          to="/knowledge"
          className={({ isActive }) =>
            cn(
              'text-sm transition-colors',
              isActive
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          Knowledge
        </NavLink>
        <NavLink
          to="/drafts"
          className={({ isActive }) =>
            cn(
              'text-sm transition-colors',
              isActive
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          Drafts
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            cn(
              'text-sm transition-colors',
              isActive
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          Reports
        </NavLink>
      </div>
    </nav>
  )
}
