/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, PenTool, CheckCircle2, Loader2, RefreshCcw, Download } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { solveHomework, HomeworkSolution } from './services/homeworkService';
import { cn } from './lib/utils';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'solving' | 'generating' | null>(null);
  const [solution, setSolution] = useState<HomeworkSolution | null>(null);
  const [originalImage, setOriginalImage] = useState<{ file: File; base64: string } | null>(null);

  const handleSolve = async (file: File, base64: string) => {
    setOriginalImage({ file, base64 });
    setLoading(true);
    setLoadingStep('solving');
    setSolution(null);

    try {
      const result = await solveHomework(base64, file.type);
      setLoadingStep('generating');
      // Small artificial delay to show the "generating" state
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSolution(result);
    } catch (error) {
      console.error(error);
      alert("My brain just short-circuited. Try again?");
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  };

  const reset = () => {
    setSolution(null);
    setOriginalImage(null);
  };

  const downloadImage = () => {
    if (!solution?.solvedImageUrl) return;
    const link = document.createElement('a');
    link.href = solution.solvedImageUrl;
    link.download = `solved-${originalImage?.file.name || 'homework.png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FF6B35] text-black font-sans selection:bg-black selection:text-[#FF6B35]">
      {/* Header */}
      <header className="border-b-4 border-black bg-white p-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-xl">
              <Brain className="w-8 h-8 text-[#FF6B35]" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Homework Hero</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-60">
            <span>01. Upload</span>
            <span className="w-4 h-[2px] bg-black"></span>
            <span>02. Solve</span>
            <span className="w-4 h-[2px] bg-black"></span>
            <span>03. Win</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-8">
            <section>
              <h2 className="text-5xl font-black uppercase leading-[0.85] mb-6 skew-x-[-6deg]">
                Drop the <br /> <span className="text-white">Worksheet</span>
              </h2>
              <p className="text-lg font-medium italic opacity-80 mb-8">
                "Alright, I got this. Just upload the pic and I'll handle the rest. Easy win."
              </p>
              
              {!originalImage ? (
                <FileUploader onFileSelect={handleSolve} />
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-3xl overflow-hidden border-4 border-black bg-white">
                    <img src={originalImage.base64} alt="Original" className="w-full h-auto max-h-[300px] object-contain" />
                    <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Original</div>
                  </div>
                  <button 
                    onClick={reset}
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:underline"
                  >
                    <RefreshCcw className="w-4 h-4" /> Start Over
                  </button>
                </div>
              )}
            </section>

            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-black text-white rounded-3xl border-4 border-black flex flex-col items-center text-center gap-4"
              >
                <Loader2 className="w-12 h-12 animate-spin text-[#FF6B35]" />
                <div>
                  <h3 className="text-xl font-black uppercase italic">
                    {loadingStep === 'solving' ? "Doing the math..." : "Writing it out..."}
                  </h3>
                  <p className="text-sm opacity-60 mt-1">
                    {loadingStep === 'solving' ? "This is actually kinda easy." : "Making it look like I did it."}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {solution ? (
                <motion.div
                  key="solution"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  {/* Summary Card */}
                  <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="w-6 h-6 text-[#FF6B35]" />
                      <h3 className="text-2xl font-black uppercase italic">The Stuff</h3>
                    </div>
                    <div className="prose prose-black max-w-none font-medium leading-relaxed">
                      {solution.summary.split('\n').map((line, i) => (
                        <p key={i} className="mb-2">{line}</p>
                      ))}
                    </div>
                  </div>

                  {/* Generated Image Card */}
                  {solution.solvedImageUrl && (
                    <div className="bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                      <div className="p-6 border-b-4 border-black flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <PenTool className="w-6 h-6 text-[#FF6B35]" />
                          <h3 className="text-2xl font-black uppercase italic">Handwritten Version</h3>
                        </div>
                        <button 
                          onClick={downloadImage}
                          className="bg-black text-white p-2 rounded-xl hover:bg-[#FF6B35] transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-4 bg-[#f5f5f5]">
                        <img 
                          src={solution.solvedImageUrl} 
                          alt="Solved Worksheet" 
                          className="w-full h-auto rounded-xl shadow-inner border border-black/10"
                        />
                      </div>
                      <div className="p-6 bg-black text-white flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <p className="text-sm font-bold uppercase tracking-widest">Ready to turn in. You're welcome.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-black/20 rounded-[40px] opacity-40">
                  <Brain className="w-24 h-24 mb-6" />
                  <p className="text-2xl font-black uppercase italic">Waiting for the goods...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-12 border-t-4 border-black bg-white mt-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-bold uppercase tracking-widest text-sm">© 2026 Homework Hero Inc.</p>
          <div className="flex gap-8">
            <a href="#" className="font-bold uppercase tracking-widest text-sm hover:underline">Privacy</a>
            <a href="#" className="font-bold uppercase tracking-widest text-sm hover:underline">Terms</a>
            <a href="#" className="font-bold uppercase tracking-widest text-sm hover:underline">No Snitching</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

