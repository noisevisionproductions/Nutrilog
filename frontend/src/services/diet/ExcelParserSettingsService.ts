import api from "../../config/axios";

interface ParserSettings {
    skipColumnsCount: number;
    maxSkipColumnsCount: number;
}

export class ExcelParserSettingsService {
    private static _settings: ParserSettings | null = null;

    static async getSettings(): Promise<ParserSettings | null> {
        if (this._settings) {
            return this._settings;
        }

        try {
            const response = await api.get('/diets/parser-settings');
            this._settings = response.data;
            return this._settings;
        } catch (error) {
            console.error('Error loading parser settings:', error);
            return {
                skipColumnsCount: 1,
                maxSkipColumnsCount: 3
            };
        }
    }

    static async updateSkipColumnsCount(skipColumnsCount: number): Promise<ParserSettings | null> {
        try {
            const response = await api.put('/diets/parser-settings', {skipColumnsCount});
            this._settings = response.data;
            return this._settings;
        } catch (error) {
            console.error('Error updating skip columns count:', error);
            throw error;
        }
    }

    static clearCache() {
        this._settings = null;
    }
}