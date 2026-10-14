import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { config } from '../config.js';
import { elevenLabsConfigured, synthesizeNarrationAudio } from '../lib/elevenlabs.js';
import { composeNarration } from '../lib/narration.js';
import { generateNarrationBeat, isLlmNarrationEnabled } from '../lib/story-ai.js';

const narrationSchema = z.object({
  promptType: z.enum(['dispatch', 'prologue-genesis']).default('dispatch'),
  startingStrangenessRoll: z.number().int().min(0).max(10).optional(),
  selectedEra: z.object({
    id: z.string().min(1).max(40),
    label: z.string().min(1).max(120),
    shortLabel: z.string().max(60).optional(),
    years: z.string().max(40).optional()
  }).optional(),
  outfittingSummary: z.object({
    cashReserved: z.number().nonnegative(),
    cargoWeightLbs: z.number().nonnegative(),
    oxenYokes: z.number().int().nonnegative(),
    notableSupplies: z.string().max(600)
  }).optional(),
  day: z.number().int().positive(),
  tileId: z.string(),
  locationName: z.string().optional(),
  biome: z.string(),
  journeyPhase: z.enum(['start', 'mid', 'finish']).default('mid'),
  useLlmNarration: z.boolean().default(true),
  journeyStartTile: z.string().optional(),
  journeyEndTile: z.string().optional(),
  weather: z.object({
    rain: z.number(),
    tempC: z.number(),
    windKph: z.number()
  }),
  wagon: z.object({
    health: z.number(),
    morale: z.number(),
    food: z.number(),
    water: z.number(),
    wood: z.number(),
    medicine: z.number(),
    status: z.string()
  }).passthrough(),
  party: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      role: z.string(),
      gender: z.string().optional(),
      outfitSummary: z.string().max(400).optional(),
      health: z.number(),
      status: z.string(),
      deceasedLogged: z.boolean().optional()
    })
  ).default([]),
  supplyEstimates: z.object({
    foodRations: z.number().int().nonnegative(),
    waterGallons: z.number().int().nonnegative(),
    firewoodBundles: z.number().int().nonnegative(),
    medicineDoses: z.number().int().nonnegative()
  }).optional(),
  recentEvents: z.array(
    z.object({
      eventType: z.string(),
      payload: z.record(z.unknown()).optional()
    })
  ).default([]),
  lastAction: z.object({
    day: z.number().int().positive(),
    actionType: z.string(),
    actionLabel: z.string(),
    tileId: z.string(),
    outcome: z.string(),
    statusMessage: z.string(),
    availableOptionsAtStop: z.array(z.string()).default([]),
    skippedOptionsAtStop: z.array(z.string()).default([]),
    strangenessLevel: z.number().int().min(0).max(10).optional()
  }).nullable().optional(),
  historyLog: z.array(
    z.object({
      day: z.number().int().positive(),
      actionType: z.string(),
      actionLabel: z.string(),
      tileId: z.string(),
      outcome: z.string(),
      statusMessage: z.string(),
      availableOptionsAtStop: z.array(z.string()).default([]),
      skippedOptionsAtStop: z.array(z.string()).default([]),
      strangenessLevel: z.number().int().min(0).max(10).optional()
    })
  ).default([]),
  priorNarration: z.array(z.string().min(1).max(1200)).default([]),
  priorKeyPoints: z.array(z.string().min(1).max(240)).default([]),
  obstacleHistory: z.array(z.object({
    day: z.number().int().positive(),
    description: z.string().min(1).max(260),
    choices: z.array(z.string().min(1).max(80)).max(3)
  })).max(8).default([]),
  strangenessLevel: z.number().int().min(0).max(10).default(0),
  distanceDescriptor: z.string().optional(),
  journeyCompleted: z.boolean().default(false),
  availableActionTypes: z.array(z.string()).default([]),
  activeObstacle: z.object({
    description: z.string().min(1),
    choices: z.array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        description: z.string().min(1),
        cost: z.object({
          health: z.number().int().nonnegative().optional(),
          morale: z.number().int().nonnegative().optional(),
          food: z.number().int().nonnegative().optional(),
          water: z.number().int().nonnegative().optional(),
          wood: z.number().int().nonnegative().optional(),
          medicine: z.number().int().nonnegative().optional(),
          ammunition: z.number().int().nonnegative().optional(),
          days: z.number().int().nonnegative().optional()
        }).optional()
      })
    ).min(2).max(3)
  }).nullable().optional(),
  decisionOptions: z.array(z.string()).default([]),
  riskState: z.object({
    foodCritical: z.boolean().optional(),
    waterCritical: z.boolean().optional(),
    moraleLow: z.boolean().optional(),
    healthLow: z.boolean().optional()
  }).default({}),
  distanceToFrontier: z.number().int().nonnegative(),
  gameOver: z.boolean().default(false),
  expeditionName: z.string().optional(),
  isMajorLandmark: z.boolean().default(false),
  milesTraveled: z.number().optional(),
  currentLandmark: z.string().optional(),
  nextLandmark: z.string().nullable().optional(),
  nextMilestone: z.string().nullable().optional(),
  dmDossier: z.object({
    temperament: z.string().optional(),
    paceHabit: z.string().optional(),
    crewCompassion: z.string().optional(),
    riskHabit: z.string().optional(),
    recentDecisions: z.array(z.string()).default([]),
    crewSentiment: z.string().optional(),
    outfittingProfile: z.string().optional(),
    entityMemory: z.array(z.string().max(400)).max(12).default([]),
    aiNotes: z.array(z.string().max(300)).max(12).default([])
  }).optional(),
  outfittingProfile: z.string().optional(),
  metaDialogueHistory: z.array(z.object({
    day: z.number().int().positive(),
    prompt: z.string().max(260),
    playerResponse: z.string().max(240),
    approach: z.string().max(40),
    choice: z.string().max(120)
  })).max(12).default([]),
  pendingSurrealEffect: z.object({
    title: z.string().max(100),
    gameplayTwist: z.string().max(300),
    mechanicalEffect: z.object({
      trigger: z.enum(['next_action', 'next_travel', 'next_camp']),
      travelMilesDelta: z.number().int().min(-20).max(20),
      healthDelta: z.number().int().min(-10).max(10),
      moraleDelta: z.number().int().min(-15).max(15),
      foodDelta: z.number().int().min(-5).max(5),
      waterDelta: z.number().int().min(-5).max(5),
      woodDelta: z.number().int().min(-3).max(3),
      medicineDelta: z.number().int().min(-2).max(2)
    })
  }).nullable().optional(),
  justResolvedDecision: z.object({
    decisionType: z.string(),
    kind: z.string().optional(),
    prompt: z.string().max(260).optional(),
    chosenOption: z.string(),
    chosenOptionId: z.string().optional(),
    rejectedOptions: z.array(z.string().max(120)).max(3).default([]),
    costSummary: z.string().max(300).optional(),
    responseText: z.string().max(240).optional(),
    outcome: z.string().optional()
  }).nullable().optional()
});

const narrationAudioSchema = z.union([
  z.object({
    text: z.string().min(1)
  }),
  narrationSchema
]);

export async function registerNarrationRoutes(app: FastifyInstance): Promise<void> {
  app.get('/story/narration/config', async () => {
    return {
      cloudAvailable: elevenLabsConfigured(),
      cloudDefaultEnabled: config.elevenLabsEnabled,
      llmAvailable: isLlmNarrationEnabled(),
      llmDefaultEnabled: config.llmNarrationEnabled
    };
  });

  app.post('/story/narration', async (request, reply) => {
    const parsed = narrationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid narration context', details: parsed.error.flatten() });
    }

    const narrationContext = {
      ...parsed.data,
      nextLandmark: parsed.data.nextLandmark ?? parsed.data.nextMilestone ?? null
    };
    const narration = await generateNarrationBeat(narrationContext);
    return { narration };
  });

  app.post('/story/narration/audio', async (request, reply) => {
    const parsed = narrationAudioSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid narration context', details: parsed.error.flatten() });
    }

    if (!elevenLabsConfigured()) {
      return reply.code(503).send({ error: 'ElevenLabs is not configured' });
    }

    const narrationText = 'text' in parsed.data
      ? parsed.data.text
      : composeNarration({
          ...parsed.data,
          nextLandmark: parsed.data.nextLandmark ?? parsed.data.nextMilestone ?? null
        }).body;
    const audio = await synthesizeNarrationAudio(narrationText);

    return reply
      .header('Content-Type', 'audio/mpeg')
      .header('Cache-Control', 'no-store')
      .send(audio);
  });
}
