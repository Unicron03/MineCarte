import { describe, it, expect, vi, beforeEach } from 'vitest'
import { appliquerResultatMatch } from '@/server/functions/gestionVictoire'

// ─── Mock global fetch ────────────────────────────────────────────────────────

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
    mockFetch.mockReset()
})

// ─── appliquerResultatMatch ───────────────────────────────────────────────────

describe('appliquerResultatMatch', () => {
    it('retourne null si userId est undefined', async () => {
        const result = await appliquerResultatMatch(undefined, true)
        expect(result).toBeNull()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('retourne pointsChange et keysChange en cas de victoire', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ pointsChange: 50, keysChange: 1 }),
        })

        const result = await appliquerResultatMatch('user-123', true)

        expect(mockFetch).toHaveBeenCalledOnce()
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/match-result'),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"isWinner":true'),
            })
        )
        expect(result).toEqual({ pointsChange: 50, keysChange: 1 })
    })

    it('retourne pointsChange et keysChange en cas de défaite', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ pointsChange: -30, keysChange: 0 }),
        })

        const result = await appliquerResultatMatch('user-456', false)

        expect(result).toEqual({ pointsChange: -30, keysChange: 0 })
        expect(mockFetch).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                body: expect.stringContaining('"isWinner":false'),
            })
        )
    })

    it('retourne null si la réponse HTTP n\'est pas ok', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        })

        const result = await appliquerResultatMatch('user-789', true)

        expect(result).toBeNull()
    })

    it('retourne null si fetch lance une exception', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        const result = await appliquerResultatMatch('user-999', true)

        expect(result).toBeNull()
    })

    it('utilise 0 si pointsChange est absent de la réponse', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ keysChange: 2 }),
        })

        const result = await appliquerResultatMatch('user-111', true)

        expect(result?.pointsChange).toBe(0)
        expect(result?.keysChange).toBe(2)
    })

    it('utilise 0 si keysChange est absent de la réponse', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ pointsChange: 25 }),
        })

        const result = await appliquerResultatMatch('user-222', false)

        expect(result?.pointsChange).toBe(25)
        expect(result?.keysChange).toBe(0)
    })

    it('inclut le userId dans le body de la requête', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ pointsChange: 10, keysChange: 0 }),
        })

        await appliquerResultatMatch('user-target', true)

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
        expect(callBody.userId).toBe('user-target')
    })
})