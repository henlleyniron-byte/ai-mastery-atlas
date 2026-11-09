"use client";

import {LabGate} from "@/components/lab-gate";
import type {StudioState} from "@/lib/astra-studio";

const loadAcademy=()=>import("@/components/beginner-academy").then(m=>({default:m.BeginnerAcademy}));
const loadEvaluation=()=>import("@/components/evaluation-workbench").then(m=>({default:m.EvaluationWorkbench}));
const loadKnowledge=()=>import("@/components/knowledge-systems-studio").then(m=>({default:m.KnowledgeSystemsStudio}));
const loadOperator=()=>import("@/components/operator-core").then(m=>({default:m.OperatorCore}));
const loadPaperAnalysis=()=>import("@/components/paper-analysis-studio").then(m=>({default:m.PaperAnalysisStudio}));

export function BeginnerAcademy(props:{shared?:boolean}){return <LabGate id="beginner-academy" load={loadAcademy} componentProps={props}/>;}
export function EvaluationWorkbench(props:{shared?:boolean}){return <LabGate id="evaluation-workbench" load={loadEvaluation} componentProps={props}/>;}
export function KnowledgeSystemsStudio(){return <LabGate id="knowledge-studio" load={loadKnowledge} componentProps={{}}/>;}
export function PaperAnalysisStudio(props:{shared:boolean}){return <LabGate id="paper-analysis-studio" load={loadPaperAnalysis} componentProps={props}/>;}
export function OperatorCore(props:{shared?:boolean;studio:StudioState;onStudioChange:(state:StudioState)=>void}){return <LabGate id="operator-core" load={loadOperator} componentProps={props}/>;}
