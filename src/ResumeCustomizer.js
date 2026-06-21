import React, { useCallback, useState } from 'react';
import { Download } from 'lucide-react';
import ResumeEditor from './components/ResumeEditor';
import ResumeStats from './components/ResumeStats';
import UploadSection from './components/UploadSection';
import { downloadJSON, exportToDocx } from './utils/exportResume';
import { normalizeResumeData } from './utils/resumeData';

export default function ResumeCustomizer() {
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleJsonUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const json = JSON.parse(loadEvent.target.result);
        const normalizedJson = normalizeResumeData(json);
        setResumeData(normalizedJson);
        setError('');
        setExpandedSections(
          Object.keys(normalizedJson).reduce((sections, key) => {
            sections[key] = true;
            return sections;
          }, {})
        );
      } catch (err) {
        setError('Invalid JSON format. Please check your file.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDataChange = useCallback((path, value) => {
    setResumeData((previousData) => {
      const updated = JSON.parse(JSON.stringify(previousData));
      const keys = path.split('.');
      let current = updated;

      for (let index = 0; index < keys.length - 1; index++) {
        const key = keys[index];
        const nextKey = keys[index + 1];

        if (!Number.isNaN(Number(nextKey))) {
          current = current[key][Number(nextKey)];
          index++;
        } else {
          current = current[key];
        }
      }

      const lastKey = keys[keys.length - 1];
      if (!Number.isNaN(Number(lastKey))) {
        const parentKey = keys[keys.length - 2];
        let parent = updated;
        for (let index = 0; index < keys.length - 2; index++) {
          parent = parent[keys[index]];
        }
        parent[parentKey][Number(lastKey)] = value;
      } else {
        current[lastKey] = value;
      }

      return updated;
    });
    setLastUpdated(new Date());
  }, []);

  const toggleSection = (sectionName) => {
    setExpandedSections((previousSections) => ({
      ...previousSections,
      [sectionName]: !previousSections[sectionName],
    }));
  };

  const addArrayItem = (path, template) => {
    setResumeData((previousData) => {
      const updated = JSON.parse(JSON.stringify(previousData));
      const collection = getNestedValue(updated, path);
      collection.push(JSON.parse(JSON.stringify(template)));
      return updated;
    });
    setLastUpdated(new Date());
  };

  const removeArrayItem = (path, index) => {
    setResumeData((previousData) => {
      const updated = JSON.parse(JSON.stringify(previousData));
      const collection = getNestedValue(updated, path);
      collection.splice(index, 1);
      return updated;
    });
    setLastUpdated(new Date());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resume Customizer</h1>
            <p className="text-sm text-slate-600 mt-1">Upload, edit, and export your professional resume</p>
            {lastUpdated && (
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          {resumeData && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => downloadJSON(resumeData)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                <Download size={18} />
                Download JSON
              </button>
              <button
                onClick={() => exportToDocx(resumeData)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                <Download size={18} />
                Download Document
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {!resumeData ? (
          <UploadSection onUpload={handleJsonUpload} error={error} />
        ) : (
          <>
            <ResumeEditor
              resumeData={resumeData}
              onDataChange={handleDataChange}
              onAddItem={addArrayItem}
              onRemoveItem={removeArrayItem}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            />
            <ResumeStats resumeData={resumeData} />
          </>
        )}
      </main>
    </div>
  );
}

function getNestedValue(data, path) {
  return path.split('.').reduce((current, key) => current[key], data);
}
