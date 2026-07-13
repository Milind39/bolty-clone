/**
 * Helper to log and execute Gemini API calls
 */
export declare function callGeminiAndLog(params?: any): Promise<Omit<{
    model?: ("gemini-3.5-flash" | "gemini-2.5-computer-use-preview-10-2025" | "gemini-2.5-flash" | "gemini-2.5-flash-image" | "gemini-2.5-flash-lite" | "gemini-2.5-flash-lite-preview-09-2025" | "gemini-2.5-flash-native-audio-preview-12-2025" | "gemini-2.5-flash-preview-09-2025" | "gemini-2.5-flash-preview-tts" | "gemini-2.5-pro" | "gemini-2.5-pro-preview-tts" | "gemini-3-flash-preview" | "gemini-3-pro-image-preview" | "gemini-3-pro-preview" | "gemini-3.1-pro-preview" | "gemini-3.1-flash-image-preview" | "gemini-3.1-flash-lite" | "gemini-3.1-flash-lite-preview" | "gemini-3.1-flash-tts-preview" | "lyria-3-clip-preview" | "lyria-3-pro-preview" | (string & {})) | undefined;
    agent?: ((string & {}) | "deep-research-pro-preview-12-2025" | "deep-research-preview-04-2026" | "deep-research-max-preview-04-2026" | "antigravity-preview-05-2026") | undefined;
    id: string;
    status: (string & {}) | "in_progress" | "requires_action" | "completed" | "failed" | "cancelled" | "incomplete" | "budget_exceeded";
    created?: string | undefined;
    updated?: string | undefined;
    system_instruction?: string | undefined;
    tools?: Array<{
        type: "function";
        name?: string | undefined;
        description?: string | undefined;
        parameters?: any | undefined;
    } | {
        type: "code_execution";
    } | {
        type: "url_context";
    } | {
        type: "computer_use";
        environment?: ((string & {}) | "browser" | "mobile" | "desktop") | undefined;
        excluded_predefined_functions?: Array<string> | undefined;
        enable_prompt_injection_detection?: boolean | undefined;
        disabled_safety_policies?: Array<(string & {}) | "financial_transactions" | "sensitive_data_modification" | "communication_tool" | "account_creation" | "data_modification" | "user_consent_management" | "legal_terms_and_agreements"> | undefined;
    } | {
        type: "mcp_server";
        name?: string | undefined;
        url?: string | undefined;
        headers?: {
            [k: string]: string;
        } | undefined;
        allowed_tools?: Array<{
            mode?: ((string & {}) | "auto" | "any" | "none" | "validated") | undefined;
            tools?: Array<string> | undefined;
        }> | undefined;
    } | {
        type: "google_search";
        search_types?: Array<(string & {}) | "web_search" | "image_search" | "enterprise_web_search"> | undefined;
    } | {
        type: "file_search";
        file_search_store_names?: Array<string> | undefined;
        top_k?: number | undefined;
        metadata_filter?: string | undefined;
    } | {
        type: "google_maps";
        enable_widget?: boolean | undefined;
        latitude?: number | undefined;
        longitude?: number | undefined;
    } | {
        type: "retrieval";
        retrieval_types?: Array<(string & {}) | "vertex_ai_search" | "rag_store" | "exa_ai_search" | "parallel_ai_search"> | undefined;
        vertex_ai_search_config?: {
            engine?: string | undefined;
            datastores?: Array<string> | undefined;
        } | undefined;
        exa_ai_search_config?: {
            api_key: string;
            custom_config?: {
                [k: string]: any;
            } | undefined;
        } | undefined;
        parallel_ai_search_config?: {
            api_key?: string | undefined;
            custom_config?: {
                [k: string]: any;
            } | undefined;
        } | undefined;
        rag_store_config?: {
            rag_resources?: Array<{
                rag_corpus?: string | undefined;
                rag_file_ids?: Array<string> | undefined;
            }> | undefined;
            similarity_top_k?: number | undefined;
            vector_distance_threshold?: number | undefined;
            rag_retrieval_config?: {
                top_k?: number | undefined;
                hybrid_search?: {
                    alpha?: number | undefined;
                } | undefined;
                filter?: {
                    vector_distance_threshold?: number | undefined;
                    vector_similarity_threshold?: number | undefined;
                    metadata_filter?: string | undefined;
                } | undefined;
                ranking?: {
                    ranking_config: "rank_service";
                    model_name?: string | undefined;
                } | undefined;
            } | undefined;
        } | undefined;
    }> | undefined;
    usage?: {
        total_input_tokens?: number | undefined;
        input_tokens_by_modality?: Array<{
            modality?: ("text" | (string & {}) | "image" | "audio" | "video" | "document") | undefined;
            tokens?: number | undefined;
        }> | undefined;
        total_cached_tokens?: number | undefined;
        cached_tokens_by_modality?: Array<{
            modality?: ("text" | (string & {}) | "image" | "audio" | "video" | "document") | undefined;
            tokens?: number | undefined;
        }> | undefined;
        total_output_tokens?: number | undefined;
        output_tokens_by_modality?: Array<{
            modality?: ("text" | (string & {}) | "image" | "audio" | "video" | "document") | undefined;
            tokens?: number | undefined;
        }> | undefined;
        total_tool_use_tokens?: number | undefined;
        tool_use_tokens_by_modality?: Array<{
            modality?: ("text" | (string & {}) | "image" | "audio" | "video" | "document") | undefined;
            tokens?: number | undefined;
        }> | undefined;
        total_thought_tokens?: number | undefined;
        total_tokens?: number | undefined;
        grounding_tool_count?: Array<{
            type?: ((string & {}) | "google_search" | "google_maps" | "retrieval") | undefined;
            count?: number | undefined;
        }> | undefined;
    } | undefined;
    response_modalities?: Array<"text" | (string & {}) | "image" | "audio" | "video" | "document"> | undefined;
    response_mime_type?: string | undefined;
    previous_interaction_id?: string | undefined;
    environment_id?: string | undefined;
    service_tier?: ((string & {}) | "flex" | "standard" | "priority") | undefined;
    webhook_config?: {
        uris?: Array<string> | undefined;
        user_metadata?: {
            [k: string]: any;
        } | undefined;
    } | undefined;
    steps?: Array<{
        content?: Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        } | {
            type: "audio";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "audio/wav" | "audio/mp3" | "audio/aiff" | "audio/aac" | "audio/ogg" | "audio/flac" | "audio/mpeg" | "audio/m4a" | "audio/l16" | "audio/opus" | "audio/alaw" | "audio/mulaw") | undefined;
            channels?: number | undefined;
            sample_rate?: number | undefined;
        } | {
            type: "document";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "application/pdf" | "text/csv") | undefined;
        } | {
            type: "video";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "video/mp4" | "video/mpeg" | "video/mpg" | "video/mov" | "video/avi" | "video/x-flv" | "video/webm" | "video/wmv" | "video/3gpp") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | undefined;
        type: "user_input";
    } | {
        type: "model_output";
        content?: Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        } | {
            type: "audio";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "audio/wav" | "audio/mp3" | "audio/aiff" | "audio/aac" | "audio/ogg" | "audio/flac" | "audio/mpeg" | "audio/m4a" | "audio/l16" | "audio/opus" | "audio/alaw" | "audio/mulaw") | undefined;
            channels?: number | undefined;
            sample_rate?: number | undefined;
        } | {
            type: "document";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "application/pdf" | "text/csv") | undefined;
        } | {
            type: "video";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "video/mp4" | "video/mpeg" | "video/mpg" | "video/mov" | "video/avi" | "video/x-flv" | "video/webm" | "video/wmv" | "video/3gpp") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | undefined;
        error?: {
            code?: number | undefined;
            message?: string | undefined;
            details?: Array<{
                [k: string]: any;
            }> | undefined;
        } | undefined;
    } | {
        type: "thought";
        signature?: string | undefined;
        summary?: Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | undefined;
    } | {
        type: "function_call";
        name: string;
        arguments: {
            [k: string]: any;
        };
        id: string;
    } | {
        type: "code_execution_call";
        arguments: {
            language?: "python" | undefined;
            code?: string | undefined;
        };
        id: string;
        signature?: string | undefined;
    } | {
        type: "url_context_call";
        id: string;
        signature?: string | undefined;
        arguments: {
            urls?: Array<string> | undefined;
        };
    } | {
        type: "mcp_server_tool_call";
        name: string;
        server_name: string;
        arguments: {
            [k: string]: any;
        };
        id: string;
    } | {
        type: "google_search_call";
        arguments: {
            queries?: Array<string> | undefined;
        };
        search_type?: ((string & {}) | "web_search" | "image_search" | "enterprise_web_search") | undefined;
        id: string;
        signature?: string | undefined;
    } | {
        type: "file_search_call";
        id: string;
        signature?: string | undefined;
    } | {
        type: "google_maps_call";
        arguments?: {
            queries?: Array<string> | undefined;
        } | undefined;
        id: string;
        signature?: string | undefined;
    } | {
        type: "function_result";
        name?: string | undefined;
        is_error?: boolean | undefined;
        call_id: string;
        result: {} | Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | string;
    } | {
        type: "code_execution_result";
        result: string;
        is_error?: boolean | undefined;
        call_id: string;
        signature?: string | undefined;
    } | {
        type: "url_context_result";
        result: Array<{
            url?: string | undefined;
            status?: ((string & {}) | "success" | "error" | "paywall" | "unsafe") | undefined;
        }>;
        is_error?: boolean | undefined;
        call_id: string;
        signature?: string | undefined;
    } | {
        type: "google_search_result";
        result: Array<{
            search_suggestions?: string | undefined;
        }>;
        is_error?: boolean | undefined;
        call_id: string;
        signature?: string | undefined;
    } | {
        type: "mcp_server_tool_result";
        name?: string | undefined;
        server_name?: string | undefined;
        call_id: string;
        result: {} | string | Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }>;
    } | {
        type: "file_search_result";
        call_id: string;
        signature?: string | undefined;
    } | {
        type: "google_maps_result";
        result: Array<{
            places?: Array<{
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
            }> | undefined;
            widget_context_token?: string | undefined;
        }>;
        call_id: string;
        signature?: string | undefined;
    }> | undefined;
    response_format?: Array<{
        type: "audio";
        mime_type?: ((string & {}) | "audio/wav" | "audio/mp3" | "audio/l16" | "audio/alaw" | "audio/mulaw" | "audio/ogg_opus") | undefined;
        delivery?: ((string & {}) | "inline" | "uri") | undefined;
        sample_rate?: number | undefined;
        bit_rate?: number | undefined;
    } | {
        type: "text";
        mime_type?: ((string & {}) | "application/json" | "text/plain") | undefined;
        schema?: {
            [k: string]: any;
        } | undefined;
    } | {
        type: "image";
        mime_type?: "image/jpeg" | undefined;
        delivery?: ((string & {}) | "inline" | "uri") | undefined;
        aspect_ratio?: ((string & {}) | "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9" | "1:8" | "8:1" | "1:4" | "4:1") | undefined;
        image_size?: ((string & {}) | "512" | "1K" | "2K" | "4K") | undefined;
    } | {
        type: "video";
        delivery?: ((string & {}) | "inline" | "uri") | undefined;
        gcs_uri?: string | undefined;
        aspect_ratio?: ((string & {}) | "9:16" | "16:9") | undefined;
        duration?: string | undefined;
    } | {
        [k: string]: any;
    }> | ({
        type: "audio";
        mime_type?: ((string & {}) | "audio/wav" | "audio/mp3" | "audio/l16" | "audio/alaw" | "audio/mulaw" | "audio/ogg_opus") | undefined;
        delivery?: ((string & {}) | "inline" | "uri") | undefined;
        sample_rate?: number | undefined;
        bit_rate?: number | undefined;
    } | {
        type: "text";
        mime_type?: ((string & {}) | "application/json" | "text/plain") | undefined;
        schema?: {
            [k: string]: any;
        } | undefined;
    } | {
        type: "image";
        mime_type?: "image/jpeg" | undefined;
        delivery?: ((string & {}) | "inline" | "uri") | undefined;
        aspect_ratio?: ((string & {}) | "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9" | "1:8" | "8:1" | "1:4" | "4:1") | undefined;
        image_size?: ((string & {}) | "512" | "1K" | "2K" | "4K") | undefined;
    } | {
        type: "video";
        delivery?: ((string & {}) | "inline" | "uri") | undefined;
        gcs_uri?: string | undefined;
        aspect_ratio?: ((string & {}) | "9:16" | "16:9") | undefined;
        duration?: string | undefined;
    } | {
        [k: string]: any;
    }) | undefined;
    environment?: {
        type: "remote";
        sources?: Array<{
            type?: ((string & {}) | "inline" | "gcs" | "repository" | "skill_registry") | undefined;
            source?: string | undefined;
            target?: string | undefined;
            content?: string | undefined;
            encoding?: string | undefined;
        }> | undefined;
        network?: ({
            allowlist?: Array<{
                domain: string;
                transform?: Array<{
                    [k: string]: string;
                }> | undefined;
            }> | undefined;
        } | "disabled") | "disabled" | undefined;
    } | string | undefined;
    generation_config?: {
        temperature?: number | undefined;
        top_p?: number | undefined;
        seed?: number | undefined;
        stop_sequences?: Array<string> | undefined;
        thinking_level?: ((string & {}) | "low" | "medium" | "high" | "minimal") | undefined;
        thinking_summaries?: ((string & {}) | "auto" | "none") | undefined;
        max_output_tokens?: number | undefined;
        speech_config?: Array<{
            voice?: string | undefined;
            language?: string | undefined;
            speaker?: string | undefined;
        }> | undefined;
        image_config?: {
            aspect_ratio?: ((string & {}) | "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9" | "1:8" | "8:1" | "1:4" | "4:1") | undefined;
            image_size?: ((string & {}) | "512" | "1K" | "2K" | "4K") | undefined;
        } | undefined;
        video_config?: {
            task?: ((string & {}) | "text_to_video" | "image_to_video" | "reference_to_video" | "edit") | undefined;
        } | undefined;
        presence_penalty?: number | undefined;
        frequency_penalty?: number | undefined;
        tool_choice?: ((string & {}) | "auto" | "any" | "none" | "validated") | {
            allowed_tools?: {
                mode?: ((string & {}) | "auto" | "any" | "none" | "validated") | undefined;
                tools?: Array<string> | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    cached_content?: string | undefined;
    agent_config?: {
        [additionalProperties: string]: unknown;
        type: "dynamic";
    } | {
        type: "deep-research";
        thinking_summaries?: ((string & {}) | "auto" | "none") | undefined;
        visualization?: ((string & {}) | "auto" | "off") | undefined;
        collaborative_planning?: boolean | undefined;
        enable_bigquery_tool?: boolean | undefined;
    } | undefined;
    input?: (string | ({
        type: "text";
        text: string;
        annotations?: Array<{
            type: "url_citation";
            url?: string | undefined;
            title?: string | undefined;
            start_index?: number | undefined;
            end_index?: number | undefined;
        } | {
            type: "file_citation";
            document_uri?: string | undefined;
            file_name?: string | undefined;
            source?: string | undefined;
            custom_metadata?: {
                [k: string]: any;
            } | undefined;
            page_number?: number | undefined;
            media_id?: string | undefined;
            start_index?: number | undefined;
            end_index?: number | undefined;
        } | {
            type: "place_citation";
            place_id?: string | undefined;
            name?: string | undefined;
            url?: string | undefined;
            review_snippets?: Array<{
                title?: string | undefined;
                url?: string | undefined;
                review_id?: string | undefined;
            }> | undefined;
            start_index?: number | undefined;
            end_index?: number | undefined;
        }> | undefined;
    } | {
        type: "image";
        data?: string | undefined;
        uri?: string | undefined;
        mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
        resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
    } | {
        type: "audio";
        data?: string | undefined;
        uri?: string | undefined;
        mime_type?: ((string & {}) | "audio/wav" | "audio/mp3" | "audio/aiff" | "audio/aac" | "audio/ogg" | "audio/flac" | "audio/mpeg" | "audio/m4a" | "audio/l16" | "audio/opus" | "audio/alaw" | "audio/mulaw") | undefined;
        channels?: number | undefined;
        sample_rate?: number | undefined;
    } | {
        type: "document";
        data?: string | undefined;
        uri?: string | undefined;
        mime_type?: ((string & {}) | "application/pdf" | "text/csv") | undefined;
    } | {
        type: "video";
        data?: string | undefined;
        uri?: string | undefined;
        mime_type?: ((string & {}) | "video/mp4" | "video/mpeg" | "video/mpg" | "video/mov" | "video/avi" | "video/x-flv" | "video/webm" | "video/wmv" | "video/3gpp") | undefined;
        resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
    }) | ({
        content?: Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        } | {
            type: "audio";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "audio/wav" | "audio/mp3" | "audio/aiff" | "audio/aac" | "audio/ogg" | "audio/flac" | "audio/mpeg" | "audio/m4a" | "audio/l16" | "audio/opus" | "audio/alaw" | "audio/mulaw") | undefined;
            channels?: number | undefined;
            sample_rate?: number | undefined;
        } | {
            type: "document";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "application/pdf" | "text/csv") | undefined;
        } | {
            type: "video";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "video/mp4" | "video/mpeg" | "video/mpg" | "video/mov" | "video/avi" | "video/x-flv" | "video/webm" | "video/wmv" | "video/3gpp") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | undefined;
        type: "user_input";
    } | {
        type: "model_output";
        content?: Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        } | {
            type: "audio";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "audio/wav" | "audio/mp3" | "audio/aiff" | "audio/aac" | "audio/ogg" | "audio/flac" | "audio/mpeg" | "audio/m4a" | "audio/l16" | "audio/opus" | "audio/alaw" | "audio/mulaw") | undefined;
            channels?: number | undefined;
            sample_rate?: number | undefined;
        } | {
            type: "document";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "application/pdf" | "text/csv") | undefined;
        } | {
            type: "video";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "video/mp4" | "video/mpeg" | "video/mpg" | "video/mov" | "video/avi" | "video/x-flv" | "video/webm" | "video/wmv" | "video/3gpp") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | undefined;
        error?: {
            code?: number | undefined;
            message?: string | undefined;
            details?: Array<{
                [k: string]: any;
            }> | undefined;
        } | undefined;
    } | {
        type: "thought";
        signature?: string | undefined;
        summary?: Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | undefined;
    } | {
        type: "function_call";
        name: string;
        arguments: {
            [k: string]: any;
        };
        id: string;
    } | {
        type: "code_execution_call";
        arguments: {
            language?: "python" | undefined;
            code?: string | undefined;
        };
        id: string;
        signature?: string | undefined;
    } | {
        type: "url_context_call";
        id: string;
        signature?: string | undefined;
        arguments: {
            urls?: Array<string> | undefined;
        };
    } | {
        type: "mcp_server_tool_call";
        name: string;
        server_name: string;
        arguments: {
            [k: string]: any;
        };
        id: string;
    } | {
        type: "google_search_call";
        arguments: {
            queries?: Array<string> | undefined;
        };
        search_type?: ((string & {}) | "web_search" | "image_search" | "enterprise_web_search") | undefined;
        id: string;
        signature?: string | undefined;
    } | {
        type: "file_search_call";
        id: string;
        signature?: string | undefined;
    } | {
        type: "google_maps_call";
        arguments?: {
            queries?: Array<string> | undefined;
        } | undefined;
        id: string;
        signature?: string | undefined;
    } | {
        type: "function_result";
        name?: string | undefined;
        is_error?: boolean | undefined;
        call_id: string;
        result: {} | Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | string;
    } | {
        type: "code_execution_result";
        result: string;
        is_error?: boolean | undefined;
        call_id: string;
        signature?: string | undefined;
    } | {
        type: "url_context_result";
        result: Array<{
            url?: string | undefined;
            status?: ((string & {}) | "success" | "error" | "paywall" | "unsafe") | undefined;
        }>;
        is_error?: boolean | undefined;
        call_id: string;
        signature?: string | undefined;
    } | {
        type: "google_search_result";
        result: Array<{
            search_suggestions?: string | undefined;
        }>;
        is_error?: boolean | undefined;
        call_id: string;
        signature?: string | undefined;
    } | {
        type: "mcp_server_tool_result";
        name?: string | undefined;
        server_name?: string | undefined;
        call_id: string;
        result: {} | string | Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }>;
    } | {
        type: "file_search_result";
        call_id: string;
        signature?: string | undefined;
    } | {
        type: "google_maps_result";
        result: Array<{
            places?: Array<{
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
            }> | undefined;
            widget_context_token?: string | undefined;
        }>;
        call_id: string;
        signature?: string | undefined;
    })[] | ({
        type: "text";
        text: string;
        annotations?: Array<{
            type: "url_citation";
            url?: string | undefined;
            title?: string | undefined;
            start_index?: number | undefined;
            end_index?: number | undefined;
        } | {
            type: "file_citation";
            document_uri?: string | undefined;
            file_name?: string | undefined;
            source?: string | undefined;
            custom_metadata?: {
                [k: string]: any;
            } | undefined;
            page_number?: number | undefined;
            media_id?: string | undefined;
            start_index?: number | undefined;
            end_index?: number | undefined;
        } | {
            type: "place_citation";
            place_id?: string | undefined;
            name?: string | undefined;
            url?: string | undefined;
            review_snippets?: Array<{
                title?: string | undefined;
                url?: string | undefined;
                review_id?: string | undefined;
            }> | undefined;
            start_index?: number | undefined;
            end_index?: number | undefined;
        }> | undefined;
    } | {
        type: "image";
        data?: string | undefined;
        uri?: string | undefined;
        mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
        resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
    } | {
        type: "audio";
        data?: string | undefined;
        uri?: string | undefined;
        mime_type?: ((string & {}) | "audio/wav" | "audio/mp3" | "audio/aiff" | "audio/aac" | "audio/ogg" | "audio/flac" | "audio/mpeg" | "audio/m4a" | "audio/l16" | "audio/opus" | "audio/alaw" | "audio/mulaw") | undefined;
        channels?: number | undefined;
        sample_rate?: number | undefined;
    } | {
        type: "document";
        data?: string | undefined;
        uri?: string | undefined;
        mime_type?: ((string & {}) | "application/pdf" | "text/csv") | undefined;
    } | {
        type: "video";
        data?: string | undefined;
        uri?: string | undefined;
        mime_type?: ((string & {}) | "video/mp4" | "video/mpeg" | "video/mpg" | "video/mov" | "video/avi" | "video/x-flv" | "video/webm" | "video/wmv" | "video/3gpp") | undefined;
        resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
    })[] | {
        role?: string | undefined;
        content?: Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        } | {
            type: "audio";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "audio/wav" | "audio/mp3" | "audio/aiff" | "audio/aac" | "audio/ogg" | "audio/flac" | "audio/mpeg" | "audio/m4a" | "audio/l16" | "audio/opus" | "audio/alaw" | "audio/mulaw") | undefined;
            channels?: number | undefined;
            sample_rate?: number | undefined;
        } | {
            type: "document";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "application/pdf" | "text/csv") | undefined;
        } | {
            type: "video";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "video/mp4" | "video/mpeg" | "video/mpg" | "video/mov" | "video/avi" | "video/x-flv" | "video/webm" | "video/wmv" | "video/3gpp") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | string | undefined;
    }[]) | undefined;
    output_text?: string | undefined;
    output_image?: {
        type: "image";
        data?: string | undefined;
        uri?: string | undefined;
        mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
        resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
    } | undefined;
    output_audio?: {
        type: "audio";
        data?: string | undefined;
        uri?: string | undefined;
        mime_type?: ((string & {}) | "audio/wav" | "audio/mp3" | "audio/aiff" | "audio/aac" | "audio/ogg" | "audio/flac" | "audio/mpeg" | "audio/m4a" | "audio/l16" | "audio/opus" | "audio/alaw" | "audio/mulaw") | undefined;
        channels?: number | undefined;
        sample_rate?: number | undefined;
    } | undefined;
    output_video?: {
        type: "video";
        data?: string | undefined;
        uri?: string | undefined;
        mime_type?: ((string & {}) | "video/mp4" | "video/mpeg" | "video/mpg" | "video/mov" | "video/avi" | "video/x-flv" | "video/webm" | "video/wmv" | "video/3gpp") | undefined;
        resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
    } | undefined;
}, "steps"> & {
    steps: ({
        content?: Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        } | {
            type: "audio";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "audio/wav" | "audio/mp3" | "audio/aiff" | "audio/aac" | "audio/ogg" | "audio/flac" | "audio/mpeg" | "audio/m4a" | "audio/l16" | "audio/opus" | "audio/alaw" | "audio/mulaw") | undefined;
            channels?: number | undefined;
            sample_rate?: number | undefined;
        } | {
            type: "document";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "application/pdf" | "text/csv") | undefined;
        } | {
            type: "video";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "video/mp4" | "video/mpeg" | "video/mpg" | "video/mov" | "video/avi" | "video/x-flv" | "video/webm" | "video/wmv" | "video/3gpp") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | undefined;
        type: "user_input";
    } | {
        type: "model_output";
        content?: Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        } | {
            type: "audio";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "audio/wav" | "audio/mp3" | "audio/aiff" | "audio/aac" | "audio/ogg" | "audio/flac" | "audio/mpeg" | "audio/m4a" | "audio/l16" | "audio/opus" | "audio/alaw" | "audio/mulaw") | undefined;
            channels?: number | undefined;
            sample_rate?: number | undefined;
        } | {
            type: "document";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "application/pdf" | "text/csv") | undefined;
        } | {
            type: "video";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "video/mp4" | "video/mpeg" | "video/mpg" | "video/mov" | "video/avi" | "video/x-flv" | "video/webm" | "video/wmv" | "video/3gpp") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | undefined;
        error?: {
            code?: number | undefined;
            message?: string | undefined;
            details?: Array<{
                [k: string]: any;
            }> | undefined;
        } | undefined;
    } | {
        type: "thought";
        signature?: string | undefined;
        summary?: Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | undefined;
    } | {
        type: "function_call";
        name: string;
        arguments: {
            [k: string]: any;
        };
        id: string;
    } | {
        type: "code_execution_call";
        arguments: {
            language?: "python" | undefined;
            code?: string | undefined;
        };
        id: string;
        signature?: string | undefined;
    } | {
        type: "url_context_call";
        id: string;
        signature?: string | undefined;
        arguments: {
            urls?: Array<string> | undefined;
        };
    } | {
        type: "mcp_server_tool_call";
        name: string;
        server_name: string;
        arguments: {
            [k: string]: any;
        };
        id: string;
    } | {
        type: "google_search_call";
        arguments: {
            queries?: Array<string> | undefined;
        };
        search_type?: ((string & {}) | "web_search" | "image_search" | "enterprise_web_search") | undefined;
        id: string;
        signature?: string | undefined;
    } | {
        type: "file_search_call";
        id: string;
        signature?: string | undefined;
    } | {
        type: "google_maps_call";
        arguments?: {
            queries?: Array<string> | undefined;
        } | undefined;
        id: string;
        signature?: string | undefined;
    } | {
        type: "function_result";
        name?: string | undefined;
        is_error?: boolean | undefined;
        call_id: string;
        result: {} | Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }> | string;
    } | {
        type: "code_execution_result";
        result: string;
        is_error?: boolean | undefined;
        call_id: string;
        signature?: string | undefined;
    } | {
        type: "url_context_result";
        result: Array<{
            url?: string | undefined;
            status?: ((string & {}) | "success" | "error" | "paywall" | "unsafe") | undefined;
        }>;
        is_error?: boolean | undefined;
        call_id: string;
        signature?: string | undefined;
    } | {
        type: "google_search_result";
        result: Array<{
            search_suggestions?: string | undefined;
        }>;
        is_error?: boolean | undefined;
        call_id: string;
        signature?: string | undefined;
    } | {
        type: "mcp_server_tool_result";
        name?: string | undefined;
        server_name?: string | undefined;
        call_id: string;
        result: {} | string | Array<{
            type: "text";
            text: string;
            annotations?: Array<{
                type: "url_citation";
                url?: string | undefined;
                title?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "file_citation";
                document_uri?: string | undefined;
                file_name?: string | undefined;
                source?: string | undefined;
                custom_metadata?: {
                    [k: string]: any;
                } | undefined;
                page_number?: number | undefined;
                media_id?: string | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            } | {
                type: "place_citation";
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
                start_index?: number | undefined;
                end_index?: number | undefined;
            }> | undefined;
        } | {
            type: "image";
            data?: string | undefined;
            uri?: string | undefined;
            mime_type?: ((string & {}) | "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "image/heif" | "image/gif" | "image/bmp" | "image/tiff") | undefined;
            resolution?: ((string & {}) | "low" | "medium" | "high" | "ultra_high") | undefined;
        }>;
    } | {
        type: "file_search_result";
        call_id: string;
        signature?: string | undefined;
    } | {
        type: "google_maps_result";
        result: Array<{
            places?: Array<{
                place_id?: string | undefined;
                name?: string | undefined;
                url?: string | undefined;
                review_snippets?: Array<{
                    title?: string | undefined;
                    url?: string | undefined;
                    review_id?: string | undefined;
                }> | undefined;
            }> | undefined;
            widget_context_token?: string | undefined;
        }>;
        call_id: string;
        signature?: string | undefined;
    })[];
} & {
    sdkHttpResponse?: {
        headers?: Record<string, string>;
        responseInternal: Response;
        json(): Promise<unknown>;
    };
}>;
//# sourceMappingURL=loghelper.d.ts.map