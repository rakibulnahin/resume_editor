import { BarChart3, Briefcase, Code2, GraduationCap, Link, Zap } from 'lucide-react';
import { getSkillValues } from '../utils/resumeData';

export default function ResumeStats({ resumeData }) {
  const stats = {
    experience: resumeData.experience?.length || 0,
    skills: resumeData.skills?.reduce((acc, group) => acc + (getSkillValues(group).length || 0), 0) || 0,
    projects: resumeData.projects?.length || 0,
    education: resumeData.education?.length || 0,
    contacts: resumeData.contacts?.filter((contact) => contact.link)?.length || 0,
  };

  const totalItems = stats.experience + stats.skills + stats.projects + stats.education + stats.contacts;

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-6 gap-4">
      <StatCard label="Total Items" value={totalItems} colorClass="bg-blue-100 text-blue-700" icon={BarChart3} />
      <StatCard label="Experience" value={stats.experience} colorClass="bg-amber-100 text-amber-700" icon={Briefcase} />
      <StatCard label="Skills" value={stats.skills} colorClass="bg-emerald-100 text-emerald-700" icon={Zap} />
      <StatCard label="Projects" value={stats.projects} colorClass="bg-cyan-100 text-cyan-700" icon={Code2} />
      <StatCard label="Education" value={stats.education} colorClass="bg-purple-100 text-purple-700" icon={GraduationCap} />
      <StatCard label="Contacts" value={stats.contacts} colorClass="bg-rose-100 text-rose-700" icon={Link} />
    </div>
  );
}

function StatCard({ label, value, colorClass, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
