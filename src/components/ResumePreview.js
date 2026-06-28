import React from 'react';
import { getTheme } from '../template_generator/themes';

/** Shared helpers for all layout templates */
function skillValues(skill) {
  return (skill.value || skill.field || []).filter(Boolean);
}

function ContactBlock({ resumeData, className = 'text-sm' }) {
  const lines = [];
  if (resumeData.email) lines.push(`Email: ${resumeData.email}`);
  if (resumeData.phone) lines.push(`Phone: ${resumeData.phone}`);
  if (resumeData.address) lines.push(resumeData.address);
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      {Array.isArray(resumeData.contacts) && resumeData.contacts.map((c, i) => (
        c.link ? (
          <div key={`c-${i}`}>
            {c.annotation ? `${c.annotation}: ${c.link}` : c.link}
          </div>
        ) : null
      ))}
    </div>
  );
}

function ExperienceList({ jobs, colors, compact = false }) {
  if (!jobs?.length) return null;
  return (
    <div className={compact ? 'mb-3' : 'mb-6'}>
      {jobs.map((job, index) => (
        <div key={index} className={compact ? 'mb-2' : 'mb-4'}>
          <div className="flex justify-between items-start gap-2 mb-0.5">
            <div className="font-bold text-sm" style={{ color: colors.jobTitle }}>
              {[job.position, job.company].filter(Boolean).join(' · ')}
            </div>
            <div className="text-xs shrink-0" style={{ color: colors.jobMeta }}>
              {[job.address, job.date].filter(Boolean).join(' · ')}
            </div>
          </div>
          {job.description?.map((desc, di) => (
            <div key={di} className={`text-sm ml-3 ${compact ? 'leading-tight' : ''}`}>• {desc}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SkillsBlock({ skills, colors, asTags = false }) {
  if (!skills?.length) return null;
  if (asTags) {
    return (
      <div className="flex flex-wrap gap-1.5 mb-4">
        {skills.flatMap((g, gi) =>
          skillValues(g).map((s, si) => (
            <span
              key={`${gi}-${si}`}
              className="text-xs px-2 py-0.5 rounded-full border"
              style={{ borderColor: colors.accent, color: colors.jobTitle }}
            >
              {s}
            </span>
          ))
        )}
      </div>
    );
  }
  return (
    <div className="mb-4 space-y-1">
      {skills.map((g, i) => (
        <div key={i} className="text-sm">
          {g.type && <span className="font-bold">{g.type}: </span>}
          {skillValues(g).join(', ')}
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children, colors, compact }) {
  return (
    <h3
      className={`font-bold uppercase tracking-wide ${compact ? 'text-[10px] mb-1 pb-0.5' : 'text-sm mb-2 pb-1'} border-b`}
      style={{ color: colors.sectionHeading, borderColor: colors.accent }}
    >
      {children}
    </h3>
  );
}

/** Layout 1: Classic single column (standard ATS) */
function ClassicLayout({ resumeData, theme, isMobile }) {
  const c = theme.colors;
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-6 ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto' : 'sticky top-20 h-fit'}`}>
      {resumeData.name && (
        <div className="border-b-2 pb-3 mb-4" style={{ borderColor: c.accent }}>
          <h1 className="text-3xl font-bold" style={{ color: c.name }}>{resumeData.name}</h1>
        </div>
      )}
      <ContactBlock resumeData={resumeData} className="text-sm mb-4" />
      {resumeData.profile && (
        <div className="mb-5">
          <SectionTitle colors={c}>Profile</SectionTitle>
          <p className="text-sm leading-relaxed">{resumeData.profile}</p>
        </div>
      )}
      {resumeData.experience?.length > 0 && (
        <div className="mb-5">
          <SectionTitle colors={c}>Work Experience</SectionTitle>
          <ExperienceList jobs={resumeData.experience} colors={c} />
        </div>
      )}
      {resumeData.projects?.length > 0 && (
        <div className="mb-5">
          <SectionTitle colors={c}>Projects</SectionTitle>
          {resumeData.projects.map((p, i) => (
            <div key={i} className="mb-2">
              {p.name && <div className="font-bold text-sm">{p.name}</div>}
              {p.description?.map((d, di) => <p key={di} className="text-sm">{d}</p>)}
            </div>
          ))}
        </div>
      )}
      {resumeData.skills?.length > 0 && (
        <div className="mb-5">
          <SectionTitle colors={c}>Skills</SectionTitle>
          <SkillsBlock skills={resumeData.skills} colors={c} />
        </div>
      )}
      {resumeData.education?.length > 0 && (
        <div className="mb-5">
          <SectionTitle colors={c}>Education</SectionTitle>
          {resumeData.education.map((e, i) => (
            <div key={i} className="mb-2 text-sm">
              <div className="font-bold">{e.school}</div>
              <div className="text-xs italic" style={{ color: c.jobMeta }}>{e.date}</div>
              <div>{e.details}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Layout 2: Sidebar — contact/skills/education left, experience right (Kendall-style) */
function SidebarLayout({ resumeData, theme, isMobile }) {
  const c = theme.colors;
  const wrapper = isMobile
    ? 'fixed inset-0 z-50 overflow-y-auto flex flex-col'
    : 'sticky top-20 h-fit flex rounded-lg border border-slate-200 shadow-sm overflow-hidden min-h-[600px]';

  return (
    <div className={`bg-white ${wrapper}`}>
      <aside
        className={`${isMobile ? 'w-full p-5' : 'w-[34%] shrink-0 p-5'}`}
        style={{ backgroundColor: c.sidebarBg, color: c.sidebarText }}
      >
        {resumeData.name && (
          <h1 className="text-xl font-bold mb-4 leading-tight">{resumeData.name}</h1>
        )}
        <div className="text-xs space-y-1 mb-5 opacity-95">
          {resumeData.email && <div>{resumeData.email}</div>}
          {resumeData.phone && <div>{resumeData.phone}</div>}
          {resumeData.address && <div>{resumeData.address}</div>}
          {resumeData.contacts?.map((contact, i) => contact.link && (
            <div key={i}>{contact.annotation ? `${contact.annotation}: ${contact.link}` : contact.link}</div>
          ))}
        </div>
        {resumeData.skills?.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Skills</h3>
            {resumeData.skills.map((g, i) => (
              <div key={i} className="text-xs mb-2">
                {g.type && <div className="font-semibold opacity-90">{g.type}</div>}
                <div className="opacity-80">{skillValues(g).join(' · ')}</div>
              </div>
            ))}
          </div>
        )}
        {resumeData.education?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Education</h3>
            {resumeData.education.map((e, i) => (
              <div key={i} className="text-xs mb-2">
                <div className="font-semibold">{e.school}</div>
                <div className="opacity-75">{e.date}</div>
              </div>
            ))}
          </div>
        )}
      </aside>
      <main className={`flex-1 p-5 ${isMobile ? '' : 'overflow-y-auto max-h-[80vh]'}`}>
        {resumeData.profile && (
          <div className="mb-5">
            <SectionTitle colors={c}>About</SectionTitle>
            <p className="text-sm leading-relaxed" style={{ color: c.text }}>{resumeData.profile}</p>
          </div>
        )}
        {resumeData.experience?.length > 0 && (
          <div className="mb-5">
            <SectionTitle colors={c}>Experience</SectionTitle>
            <ExperienceList jobs={resumeData.experience} colors={c} />
          </div>
        )}
        {resumeData.projects?.length > 0 && (
          <div>
            <SectionTitle colors={c}>Projects</SectionTitle>
            {resumeData.projects.map((p, i) => (
              <div key={i} className="mb-3">
                {p.name && <div className="font-bold text-sm" style={{ color: c.jobTitle }}>{p.name}</div>}
                {p.description?.map((d, di) => <p key={di} className="text-sm" style={{ color: c.text }}>{d}</p>)}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/** Layout 3: Compact one-page — tight spacing, smaller type */
function CompactLayout({ resumeData, theme, isMobile }) {
  const c = theme.colors;
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-4 text-[11px] leading-snug ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto' : 'sticky top-20 h-fit'}`}>
      <div className="flex justify-between items-baseline border-b border-slate-800 pb-1 mb-2">
        {resumeData.name && <h1 className="text-lg font-bold uppercase tracking-tight">{resumeData.name}</h1>}
        <div className="text-[10px] text-right text-slate-600">
          {[resumeData.email, resumeData.phone].filter(Boolean).join(' · ')}
        </div>
      </div>
      {resumeData.profile && <p className="mb-2 italic">{resumeData.profile}</p>}
      {resumeData.experience?.length > 0 && (
        <>
          <SectionTitle colors={c} compact>Experience</SectionTitle>
          <ExperienceList jobs={resumeData.experience} colors={c} compact />
        </>
      )}
      {resumeData.skills?.length > 0 && (
        <>
          <SectionTitle colors={c} compact>Skills</SectionTitle>
          <SkillsBlock skills={resumeData.skills} colors={c} />
        </>
      )}
      {resumeData.education?.length > 0 && (
        <>
          <SectionTitle colors={c} compact>Education</SectionTitle>
          {resumeData.education.map((e, i) => (
            <div key={i} className="mb-1">
              <span className="font-bold">{e.school}</span>
              {e.date && <span className="text-slate-500"> — {e.date}</span>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/** Layout 4: Executive — centered header, skill tags, timeline experience */
function ExecutiveLayout({ resumeData, theme, isMobile }) {
  const c = theme.colors;
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-6 ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto' : 'sticky top-20 h-fit'}`}>
      <div className="text-center border-b-4 pb-4 mb-5" style={{ borderColor: c.accent }}>
        {resumeData.name && (
          <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: c.name, fontFamily: 'Georgia, serif' }}>
            {resumeData.name}
          </h1>
        )}
        <div className="text-sm text-slate-600">
          {[resumeData.email, resumeData.phone, resumeData.address].filter(Boolean).join('  ·  ')}
        </div>
      </div>
      {resumeData.profile && (
        <p className="text-center text-sm italic mb-5 max-w-lg mx-auto leading-relaxed">{resumeData.profile}</p>
      )}
      {resumeData.skills?.length > 0 && (
        <div className="mb-5">
          <SkillsBlock skills={resumeData.skills} colors={c} asTags />
        </div>
      )}
      {resumeData.experience?.length > 0 && (
        <div className="mb-5">
          <SectionTitle colors={c}>Professional Experience</SectionTitle>
          {resumeData.experience.map((job, i) => (
            <div key={i} className="mb-4 pl-4 border-l-2" style={{ borderColor: c.accent }}>
              <div className="font-bold text-sm" style={{ color: c.jobTitle }}>
                {job.position}
              </div>
              <div className="text-xs mb-1" style={{ color: c.jobMeta }}>
                {job.company} · {job.date}
              </div>
              {job.description?.map((d, di) => (
                <div key={di} className="text-sm ml-1">• {d}</div>
              ))}
            </div>
          ))}
        </div>
      )}
      {resumeData.education?.length > 0 && (
        <div>
          <SectionTitle colors={c}>Education</SectionTitle>
          {resumeData.education.map((e, i) => (
            <div key={i} className="text-sm mb-2">
              <span className="font-bold">{e.school}</span>
              <span className="text-slate-500"> — {e.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const LAYOUTS = {
  classic: ClassicLayout,
  sidebar: SidebarLayout,
  compact: CompactLayout,
  executive: ExecutiveLayout,
};

/**
 * Live resume preview — switches layout based on selected template.
 * Same JSON data, genuinely different CV designs.
 */
export default function ResumePreview({ resumeData, templateId, isMobile, compact = false }) {
  const theme = getTheme(templateId);
  const Layout = LAYOUTS[theme.layout] || ClassicLayout;
  const hasContent = Boolean(
    resumeData?.name || resumeData?.profile || resumeData?.experience?.length
  );

  if (compact) {
    if (!hasContent) {
      return (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-400">
          No content
        </div>
      );
    }
    return <Layout resumeData={resumeData} theme={theme} isMobile={isMobile} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-bold text-slate-900 px-1">Live preview</h2>
      {!hasContent ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Your CV preview appears here after you import or fill in your details. Scroll down if you only see the JSON panel above.
        </div>
      ) : (
        <Layout resumeData={resumeData} theme={theme} isMobile={isMobile} />
      )}
    </div>
  );
}
