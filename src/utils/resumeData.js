export function normalizeResumeData(data) {
  return {
    ...data,
    skills: Array.isArray(data.skills)
      ? data.skills.map((skillGroup) => {
          const value = getSkillValues(skillGroup);
          const { field, ...rest } = skillGroup;

          return {
            ...rest,
            type: skillGroup.type || (Array.isArray(field) ? 'field' : ''),
            value,
          };
        })
      : data.skills,
  };
}

export function getSkillValues(skillGroup) {
  if (Array.isArray(skillGroup?.value)) return skillGroup.value;
  if (Array.isArray(skillGroup?.field)) return skillGroup.field;
  return [];
}
