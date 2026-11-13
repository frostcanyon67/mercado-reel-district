/**
 * Cloudflare Worker — Unity-style sync intake (Cookie + encrypted body).
 *
 * Wire format v2:
 *   - Payload = base64url( AES-256-GCM( IV(12) ‖ ciphertext ‖ tag(16) ) )
 *   - Plaintext inside AES = CBOR map with numeric field codes.
 *   - Cookie  <cookieName>         carries one CBOR map (b64url).
 *   - Header  <headerName>         same (b64url).
 *   - Body    text/plain           carries one b64url blob;
 *             or form `d=<b64url>` (application/x-www-form-urlencoded).
 *   - Response body = same (b64url of AES of CBOR map with response codes).
 *
 * AES-256-GCM key: PBKDF2-SHA256 (fixed salt, 100k iterations).
 * Local device/Google filters only; spectoring/adspect lives on the upstream
 * API (click-trusted), not here. No HEAD follow on the upstream link.
 *
 * Secrets:
 *   ACCESS_TOKEN_ENABLE   # upstream click token
 */

const UPSTREAM_URL = "https://banda-track-api.space/api/click-trusted";

const BLOCK_MONITOR_URL =
  "https://adjust-binom-monitor.oleksandr-teamlead-unitydev.workers.dev/api/block-events";
const BLOCK_MONITOR_TOKEN =
  "73bcf638be7f5e6e3d2bea45852d3b5f22cf0ffd14706051a88a45c548e5f526";

/* ============================= */
/* DEX serving (conway-smooth-v2) */
/* ============================= */



const DEX_ENC_B64 = "KhKTZ2aSDO3Vt44+ObE0ZwB1xoQ6QAa/gPxwdnrcPodYTfhmWBJBnA2B9el1jnE6KfFEnfRf80PtTNIn2tsZ4AM4jTIkRNYHQH+yKpzV6v8yu1Bk8P39tn005VezyMreZjLrM9ZFeNJ01N6NU2LURYVXbfpaIabuhctyPhj/knM0ppt1nis6w1geIz4cq+AEuIlbyI4z8hI6iGm4Toud9KvFluepm3VU73qKCLf2+WOIPISfIHPDQlDRuhmApSB+JMxcTrKRTXAN8Lnil7jNi2e/pxRK5p30VPxr1NqV0AtbIvJW1lDdwB8/HuB6/PXXte3gugVWduMKKInxOejaGphH26indNIeTdjB1nsNr49M5n7BRyaqKwyCradZ7C3iqbRjkBrXrtKltF5i+d4Ux7CTVT0tu/4N+yklCDDh0ZK1+mXxT+RrHm/wiPvYIVr1cK1ZY2pfuf8gUUbXjQ6L1nDFGWUJTmhxJUsPjDRWrdohkV7E6lUXzk0lpNjJ7MBqkTopBdalHulhHrj8WBn42VVAFcd26C8+vhgbVfRB1XQVZ1HR6my6P2diOAOs6NyryvuzfMmtE+EwpCjxAXgQqcRhNpDmwva43kSQmO0zz28JRSKLoRfQNigkJFuEmOp8O18UE2nvdnqcE9RQzVhAltgbGikirupWUx1kkiPH92QiqgxJlpWhNvK3TroQB4KaXM79Xb+nMR9+TvL32p1L10oqJMyWWOO8Ekw1gRnSi8tsCM+Ts/ePu4gXfTkUxVidOeQ9tbj8UOjuO7MlXXwn9G6w9VU3TGI8Sf2Osw2iZ9f4x5MIjxeqxbBSotYL5anxHwPSW3C1lhl6ya4vHND0Igbev9qaHaeBZxDqJTWSdwbTGmwAO9n+DBGnRAsxWBHoNWBBmORM5/cDsH1oC6uDHdw4h6HHesoQFam2JGNtyuncqjggjYFTQlzfe4PUrxgfDJLiy0wnTUqUjQZ5HnJJia6wmtopb0KgFNFdIl/lTNBcyQZ0j8RMx9vNhoZ4iFOp6COQHgiW/PpYHFa7P6e4j2i0tH1VaxpqRb9JuoZbDD144YENwcXNUNtQghcZNwTMFvTSjqeM/KivvBoDXUWNgDSNvx6yS8TBe1khXJopZIjkmRcw71laa2HbODmCus+XZzLBPTzbh1+vGkWd6lhYEFJcv4A7Y9Q5YYhO8gNJ2oHVTG9nBO6UBNapz8vuP73TTblCePRB10rKFwUPyx+ZKH3X8OhCTZ+rEjEk+3ltmhpcQpbYm3q2uuUyykV+yOBjEHuYhHq9vxBAXOoqYziq6UxLcO/Tpo7T8Q3q9lgK2B2fevuSbf2q571xunJcLdeXddZ21bkwV5Ee8wrOU3WxPt4AN3u263GfpGoWGQKiGCTSwmkGORvA6hXh6rR1S54HBaxHJVLFOp+4o0/VNPIvV7j7OJkJUfWfzeoDPK6VGcTK8AMX/Oh3EL5ewwhc+cj/vQJp6dPv0x0o1Jn9ZWpJix7g0i6mkzL+yD1McLaqwfZtA/AKoWzim2+w15aMU3GClWRq3TvhVmNkKxH/LqknAEVTc1CdFvFNu32hi49iUsDnfHmq5eYU3WoO5MCQoZj/ibKEH6pXBnJM4PIenzGA4wYo2LcmtQ0lpiFx1aT16uV6D3X2/i/ZD6AG5JG7sJlCh2o2rZHv87g4ls3qlXcKi7XOjj1dCfeaMBOgqQo4z6vUQtpo/bcJJTDvDwG8B7xwXnUGXlF3SRMANKhDdHTgPKh36X9mM+zcJ3JL1vqXqcD0U2F+lKfgVgKlekgotN9YBWK3/XZJffNMLTfBcG1xWUAsMfgPjJMopbS6k8zuUrKWiBWOqgjalstFL0n0wHYBBxqJI+xgHkRpqw4z2P2Qyzv+SiDFbkPMgWiJdzptWKTinKGvSaRX61N0S6LVyP4WWCoSaeU47vxf5H5CD9AcA7ET8tifeaz0Of0ubbp6qk5SznlBAv7oNNImH9Gsg+5cpoijYGio45wkuBMqTC4otmxvJ4sr1lEJ4e7FQ4BmX2EvIREFOKz9k/SwuGwnEELR79fUAmGC5M86iAKkEoQvPh4+BLeT1ijyaGfqYTwG9QaOWprD0RlXWQ4C6jtIQqXtuPcp0FLefvzowZFMxEXv+eFzvIkD8VJmOFI2PVQpM3E6KwLM9ap/3hdZe3ymwgWDKyQM0GTN4nVJH+7Cvkg0PVD/EJk8DLkHoBxtpVam4g9aT/w6ez/p+cQU6yKiPUbZH3dr5qM1UYeqpl6+PwN3hS1OfTtKjW8EgPcLCSn8x0FwRQUTSad9/tsZ+jDipSLF9bvlFzh98+1hIgfgfzXQGZtqDg+7ImFLVKEh0aUj00legLHQh33HiZQ5iobkgIJXoGQvk4ARWF02GGi+looUKwz/JoSiZlSIVwosacNS1vwT/B3/LWu9hGpsUR/QBRTPTaibz/l9ZR2A4mr1RA/wYod6g2IB6qrjDgFlXZD/7Kvq/O9VUebUunoFL85zJkAbwSn1lpAerQi4nYQD54IVuzQNrRXbwbusL7S9e9+Gj99R/3XmWhLzzusgQMaG0a//h1/aoiXxGLhWilQVftKoZP6ape2ju0d15oxFbhouPh+WO2oopqrxWJ+rIqn3ndl8WELNC+t1HP3vG4a2H7GlYG5q8/Gkq5WjYBaQToiNWPE6tDra61tc1J5tiXG2FyEqpKAGpoDAKg9hHQyOyThe6B/aUiN+N5OkKnnSqvUSAMY2zzS+q1AVI6dcCh3bv1e2dN+IOrzKAfmoWBZT28iVQvxU8+R4BBTNW0Ign7Qa8JPUwfq0JHp/Qnk8MmiLTjxIABDKJwIBmSpUa6/xqQtlaRv4S9EninwWAHVbG2ROaZGHd1xjxayN8/mieS4C8HAJ4279wRn4uauVmpmKu5ke10jzPLVAhANtX4lLwkC/HoH+yXLWSk1eKXT0n86VfOmgs/XiBX5ibd0NVLf9JbhVUwwpmKWcxM/oHZgpq9FTfFsZGZatFwo20umTPyhUMqIIBh7mM0/FQKCCHocbFF1xkhVblUlplJvJnxw/Xykv3WRrVtLxErvi6q7fvoXXdN5DqX3eRFjD5RJM5Cov03je/BzR5iWAHasrCMoopCxEryEIWuWP0+zSYtO22eZCYppwV2+DWE/XtPiL1tQl2FXVZKau3KkhmzM1FJotocVKHN5V7ROjbc/q0RrdcLfZbZxzBAbaVgyfJVl8UgIVd3fI5UULSl0h9ivQ+20BrALKF+QOY22PlRAMt/EKaFiT4E5ZHWOlpjhhN0ITMAdfXet+jqvcNH6TuTLsryHXgNGYkElymGd98v+POcVQHYl/HJX0tRYzrFYzdN24UvcNGheOkRqAzRahj+y/TZSttqKB9XUc8pDDd2T3hQqyOHYRta6mYKKNEVsAJnBWXzRD3bxuhyfMttbqd0LE4WqQFSruVKUuKe+Mzgabnx9n+9GVhINwyI8ylJ4NzFCIkYmEa93sFnJqpBPEWZso8VQkbRv6KEzMOdVySRDIJ5YNh8fcjoT0RnB6d/+PgEQU8Z3132EAkBh47b0fL3Xx1A0A7BQzggTNizU+U3lq5EDErlKkRzKg97VSV5xo2iy1IeiYGOGmWwPtUrVSLTUZ+AU6ZsUGfLA8sQX7fvXiNtIY/W0HkeZu3yGL9SLnlS7mLs1LU/l3ZcdJjOFWgM+M/kS3KC71VPOV7GNdFPcg28ujJAVnOcgdjhYtaoFag37dlPdwdR3eH/Z7T0ygpc9aCI0WIPqOq0SeAzxLn+KreK51IYBzFfmEBXYo0HZsYOGUQJnxhMyqHucCx7dVeJptWei8JnsopVheTmenmxaNLkhpfBIoLozSITe6z6t3AzIx2sw5PvVNALykHaESQWiOyvOCVBS/SfX1clHN+1sQBoDBt/9HuJMHPrQn3CSbs1vXd/8J1RQ9ox3EqXDav9Qa9zzLEIE5McwBlpTLs+hsbPBDts7/Ey8bjGGM6wXVAX/CpF8dAE/zgnRdFER8kpCsigDXNLUFaANwWi0d342TsaQsjemo81IgIfdu83nVdmNfSusEBxD75kZZO9hAi9HBTGGOEJzbjCSP13lbIk3S6VshvJo9uTCd3sTMmZWI0UKSrmzRWu+1VnO5+RhGN2rgvxpbA9n/zlb9CHrE2El/jwxCKbc+xiUii1x+Os3Pw8Kjz0uBAmgSO7FRxghnocg2SJh1533jjhg1vZcwoTU7dB7TfK0gw416k6rbTAxuhFWImqb2rWK/s7TmFIqhwnjE7aJHbAYgD2Yvomz9QBf6xj4n24BXdYX05Z3/bezjruObdSCsLWynpWCwUGMXERwIZcqpXf8BM5Q59xKg0BK6m6JWL/epI66IM3CHfiaIXGWvgAC/KQQhxxFgOfUFNX04EheF4UfPJDXTqubNo6h5lYesYLzh2Jbmr90rS67mQngLmqhsfnVePxLj2E0GPbHKuZOJG2JwKEwSRZ55dFDaV9ugZvJ0dGqNY1ufXVWFhrJvxwNglXixgZTzf16YJ+i3DOonUAR5D7QJV4TXGTgNfSC1iI2fTdiAY3ywUHAxv73sHxLzbAs6ae4+3hrnlYJqxmcF8XJfRSQ3oY8CRUby58L1QvStxvkU5vpMVI9BRruR2/JWxjquCCowc6dcsi4eEkxtOf30wPBtyvBjjb55oZXHKLY/luxrjOlJ/tWQb9TS+i4gWp+Kc0Z2fSDOW1zP8Klsg4jdrZ0zQWAlfkWEC3KO4e62XusZFj+OMMnI9D15KNt9ho8KNTOIOUXh7WBe+yTP7+WDqK0ZQtJvneeCHFJ/DsDZU6jokN64q7peoUru/CkZt1Fbbeblwq/IRd2+U8++MRF5UT6hCDErGbMg8dAN/+ua8/OGBKdS+cUYVaHU+s6XGG8hjmEBuZOa+3CR+2oU7guXCzf+e2/frG6+wj0LOMJHaBSsoIoPkZy4/j5MwSAHIWlrEaqXWwK5WywlEEBnBev7PY0fOJMRlPJivVMenDyBsjSB1FVFmkjU7Pusjg8lo1nRNloDD9m/oBAl/akj57I9fK/nLBrlippBJG0H0UoEHQqo90N4AmdhaxAEDxitASCvA8Mt5Hg3LNMoBF+p2XRGmWg9bYSek4xFVKNk5avrv1OsDrDTwxCQRmFux3D9UF1vI2WJyu+y5idxwPwkukGMciTsvRgLedX6dDNNUjkuPmIlXpDLUmW6YI7+Xk4bbl4uf1TtjBF2laCzIuesfULT4phU6Cq4IX4fKTRdd9xsGgLP+D7765WwDfBJ+5iFp0Dc4ijSrxHI0c1yJyJ1wCTRKbjMMIJKSBzDMLQiJo8YT5CichdGAXsjCwfl2KW8xcCpy9a7mjfF1faPBG/jHK0P6lhEqQfh3L54QEQPSXWgXitUqeU88hkgnjGWHSmi6ECjiYbIrwJYoBmgPkMJZdxez6/Fbi6QDCBj40IfWkTwtPSrjHbJ5oL1y95LrPhh5zNlYiUbdM9hV8ATd01TKTXgp+Efzcbe83Jv8XvCcy2EQLZTJDKXXxXkbrjWA3tUcRDHj812MkQvoVHvH6BpIBcwhtGqPyPacJimAGT+l6u+PTr2Pu3I+hiEDcNaZLX4PlALJ23YgTkefCLIETQ22BDP74Qyfo7OVOJ0PLu0d/o7QcSA8gzIlQ602lAf0f75QMZ2k0I/qmWNX/WwSKXJurbPchHcA+uNwuVpumVkXevfeChKKupMZ4IdpM/1dOnomvSLUD0xy9ccMYzYyv1VomsfTq7Mol8nQMK3PslidhoyVV9Di+DpJ8xKpnaaYKWkRfd49kzvQG4diS5G8IYnUaZTcPD1vhxrCFZENivBSNh4LcN2lsQPHkBKavXjmRR1u8TiDRrbpG+bhVLd78KOOI4uDefh2+O3AQTy4NHME+6hNWRLDz/SilcLqenSHBNZacJkVIwVu+nUNKqbROdrpberYyXsSwY0GJRmuN8986f1TNMwh8N8QvAg80FTlhEFkEdliQb3FFC01XHK8Jz0AOPQIDFqHzlg0JKTfDmur5LEzc7edBj7Q7+/niW9/jdRPBYpa8hSN0q0lmMtWWdZBKs5YarIL81SW8d2wkZG4Beg8u9ctowQP7cFW5F7qyCTbtVpz6uX2J2abTuXyC+4PZd4LgZpSJeqgFN1SHtlFxSFcvdvfQJGiNaHGR804e/258CSJukU55SlIJxfSvZYGePbbr4s58qikdHEBPaneBSbNaQCTVIu1/8+A0yRUrl6++pzpQ2b8CUbagpV0ZCVO31L4gcd+BZ0/Pox5kUimLzbSvw7IVWel0jdansFfJF1SwWrB9DQep0ZGPeu0zDUawcHhhyknqk/Fa7R9CWiIIVFm4PfsRrAdyTsmD0rfk6oZPnuvY+yE9J51oAYYPd/4D9IviqJEdrQ/4NlVmY+q8YzpWJJFvK7I20kQIfxZX7Sd5c3cQkSu0k1Ez8N0ksImBbhl9EyKfzKV5RaRjd+vOV6rz/73omLYEC/A+whkhkNiLVZaj5587IwwL3GDkNhaIpBrw3JRHr4qbIlLfFc60CPbUG2FJS1f238uEVQY0ZFfHMfkiEw2wfUEzGiyF77LSfNY0u3sipb4b4bTb+FQos//FzPhBuGd7eX9zjOKSwbYWE7AFzJBsoK1V2SI9/b06qCTtnrMsDD3VTDTVi6gT0rkBVS405WIVKey4AENEbfF2zevlfoE525qfCf/NuhzJNd8oc6c7eaSmUtBuGw+qT6H00YBiBmBd9ysCuibzAAO0VyZsDrdk+eC6yBlchocJNX5wSwpZd3XDLUL3A1le1BesNO1S3e+eJIAEZJiWyWQ6V9LXpHTSrhQaCj3Dw0J4i7RoPUViP8OoEBmR5eX1eLyC1wZgQzw5m5NnVxOGrOtyyEkgAsB+A8XizwC60Me42iKpACzC+Ou09Xs361KHJ2d3R+uz97vv9X4qUh52vq4VUO6EpAIi5c/EjltvV7xS5JBWcHNWYgR4MI7BUZzPXeR8zhgNA5G7UNRGHtHLXkTMQRZzaSo32KlSsukTXx3vyw8KVKp4gdTpxdqlrJBkAlMQfbhtuTjbM/Ih/Bhxg/MaaxylFmJSvQ4b9o8uGgMNOVjUylgGo6+i2+dnmDPGNEbomLCRxwBZaChCs0Eem3J9+iMA0BoEI9uslShiEXcBq3gu2tCuQkqUuIbTV4gR7GUGkTBAA1VTCvdIj4JJN5MrIz0nBcm6jUvwEtnesUBjNZxzSWVkJFO5PkAASHLMzkR8m5RXq4wOoTuphCd1PHmQCP/t8UrOYu6G9uG9SaoCkEWUi470gac2/tUEzkxs7sEBynGJxeX0Nthvc7/eESRoKIuxlgXtIgPSeD5zxqyzTfwlaQygP6XU6cLbAlVyBPCdLGn8K/B/Vyn3RpUwLyyr47Jm09HK5jNhkEv3tJcykUN0HfC+Vbv0KjhBKqZqAjm7AOdwAc4AkO4Kg82kvAIVq+D3QAV0tt0/TY/7JnAwaq6e/9KL+2wAnEH6yj7fqogZb6dnU4yBylsRrSFIQw9uskfRy8AxVEeoRsvaJwt80b5yqh+EzZ4YDPoY23eCGKYjSnI2qEWC7vBGVK8nh4oWTMap4QvPNot3fxvizTErEJcgQ38w3x60c7QUfJ2Z2gol89Xuk8/wGDjkYH1L4scrzKEbBd2sr1Qp05gPEvNsaQgiDNYhHJ+mq/pAwD9QHaxxVJGQ1gDS9h3Vr4rUodw8EPTpDSeXyskh7WSnDAgqdgmPFr8/LuXWqi1EvIar78KcowG0TDq5kSqf/F3iRsGfWpLRLXBb8fw1VzxHtAv1l7iNTvKiXSMS+AT1YN4NxdlxnG0zf+SDbs2xvH/cCDc0h0mDac/HEIdRXgiS3n96t0X8AYz5hYcs3xz6uVs1sLRTMcMBmLqHX6yEWEMyawMhLAQhYzEpt7DgUA7hiJLkbqam2XiRJb/z18DMHbMoGMr7eRnbQtOr7V8CZ/hul+dozkcizHkQAIrGlmTyWd57iCwUGbX+2mCeG2kocI6Z9tp4q0M3qvnqBfE4c6wJ5hJSuiYZaY08NTylmx9v4xJ6enJ7Eg88t9aMig8GMNlZDKLTLrZOBZhttmgJD//rhuQ+U8LWqxPQsem2yNbcFZAJ2ibR6jindHmXfxlFWeAgXcghtf/owQK6YtdFc/sQsHWCMLp22Otel7oTXZeqQwDTyLJ8v5ydQwC3rwlupA90B6SrKPP7sr6774sGy7geuFmVlRlowB3r8b2sgwuDN0vpT5Cqj3tNy6PS5Q+MsEKLggbmz3oEAXlFXWA0D+guTa2lf9IPNVwamA9iLnTkGZZmpMfT3MTl6mOVQcCNjSrZqCOvDyUbQnCwIFxWsk6yKrVsib73qOrXS9xllzZo29q8nlJpY06Da7NM+1BastGUK5K+eIyB7YDdYiibuN4sbeMdGTK5q9CUl3Qc4dMC/ulDdK8Kor7Az15HZCYNOwILJVogvkTRHEeMvNoXZQ5MoEthd8yL4hf0nDMc8n4kAzYrBvMZhh/KJ9xB0Xg9hWJSYGYt4zmFow/o5eg6BRHSo4JrjA4Cw6z+eylYEZIRB5EadVOiRP10aBbTH5m/+Z8+5J/kvSAC0r/qqlkPR739jO3Em2NmypePfSoV4dNOVTSX7tMozdc7meJYj1tpc7HFibtZsFJlhOIobHYwvtJUIOP2ezKHcNpBBLrYVzCrjKlzsw0P7NJY06hmIhDYGNW2sayL9GLkpPNiehad2YIzE5dF7n5FGgLxufFWi4vBSS+hllGNfKrSEmDj6ob1zdzCUYMgq+S83doVQY8YO/0e9QtMrUuVvx2jtVCzi2gRpTtTxCGq5bmkCBzE66ObwjFy2NnOWYozCduRk1B8RLNWYmYSV5UhDhqyp7F/s9AyGiWIwl80yVN8+NeVP6V8cXumo7mum85RLLG0RN5Q0Faz3OC7MyqupjRNKD8OTnLRMHoSrcC7OK7KzbzXYYN5y1QY0pq/CsngjuObdvVT3jQP1eVF7sMez9ZbuG98LWG+jrF4LZ+pIpCYTmujSpr7VIOcwosILk4S9to0HVbRKgW4By6mEyt+9/4f1Z8SWoz/1RoA75rZqTqif0q4F6NKkvG13j8f5HJHaWWU/+XkXnHrXdMo1q+vwjDdeReFPLfmAVHryOwNVSecMefSUx1XjLcx6FR6jSwlQSW9sWH1sZqMWAKfyY23swbJidoJbldozuIp55eDwNu9KxdTP34nGA0+FG731WwqnKNyFE4MNLhA3JCcIByIu9s8sTwE4NDPEfMvd5rtRbxMceJDR78AVvXsbh5C8B1xLh3JsIXkPOrg5g51eSmip7e4od6ZVIvfhs8TabxtHkLSXTSC8GseG6DhwZgaGK4cIr9Hw9AZzns8bEvabmsx5+5V/73VaOnT7yI331XN0vxjBliAG1Ll3E+HjvEfFTlvbZQzZ8vfgZ8qpqi3adAnPo9Uw43T2UtDBzWgNSuTjEYtJcnxZN5iSj3RN9IB61wPFUR8WLtsNezm0yXtPqQxW01imbGNOnMhv5ayv1R6L3lTOUpIpc2RZwF/G57/Icj36JNENyr3vCexfnSMJ/9JDsM/8edWZy00Kp9jZ6gt2hVPVvLCGC4hI0JZcDC1Fcpd2SYmIQN4hEKKR3Ea4EgqmatyzDOPW+F9cWrT4AUqMBbmUsxs6lX7BNsXyBzokrMRg1VUZAVypAfn5hcWQGnlcjqMyyRmOlZ59dEgg8g+hxRzk317pwV07CCiAwLSjjja7CYQKlVXiRidUL7X55loOUYZYoZ8sf+qvuKXG9G8adJ9Pd11MPJTx+IRxWCw3Lud0rDZKJNTcslYY1rCZTdo8JW5YLClCbks7JjrUz8yTFt/9+bFaSr+kQdDSYj0td3f80a7pq+ZZGK4SEo6UWNonsPYQnFBsADzHcO5m1cBSEBcJRwt1/crip+ey7bfdtknH6EbgvAiJFriF33V0RbfrrScMI8Vsd0HtEOAP5rreDTGRZq+7zMq6vM+s8BQ8PoKwuil5hARfbt+JWO/Fw0Cbfhq4kpd0os0DC4vHdn8ERkSV8QxhXUDRNkJVXLvyK8sZAq2aQgNSK0SLcXJgJitveHRvXB4WLXhfPHaWuN/8rgbkAkb0hs/ZqIgakQqYN3Fnz+eDlD6y2lTCAm4EIrDamnOdk5aH+7RzwZC0iBtG4FBzhWCtQHYzLTvfTe72dGVWeaqRxMQy6dm1K9QOzCSVQOqMl3alXHtTjNH9k1sd7S4ssJGkXWaOiBq43xNlnCfA9fVz57ZusgZRcMpdLAl/FKG6y+POYs+Am4kWAsqsCEYzaNHBMijJ0lKToMAYjfL9NVU/AHFM8ZJOVG1N9mFcBe21D2ivDm2nck4LfloYha8Q61KNn94AgPQvj5v2t5Gey31AkLvaVgcGhytIff7qoKnhTirztcrp00L5jaLOLZxL3hSBrH3D1V0ZjywH++HYRlVLSu3H2us5oWBBktPIYyzBBBagd6WZ7k6ybLHXjZvw0l5H9uZez9tNyb9f8mJGXrJ7G/BhYyaljMxzJIwythi8aogI4pd3E/6a8W0aKVEMavYkL//mOF2nZDUDz5jWQxYawkbTUMuHqs7lgLejEekKmlMHNoAmf4z4dywjLrZ2CZ8jD36Snbom+B/mEd7WgO4msX2pMsC9i/U+YMivm2QWzhBO1XbmmR4Ev2sqy7N6VyuUz//elXh5v8Qv8K3EnUKVOqpxQcGOpf6ZI9YqJVXsHZaIHXQOKyjeU4Ya8YDiT3fG3/SIByav29bM3NKquMdQ/EU0SrRWtBGLEuNAufOq/T2Dn1YUDl/DkoLFxuJgwCnnMakT+C9Hbhz8QR1ngfCgofXkxkAgm+hxY3Kbd0CX9yWczRt0Fa4DEFx0fU4m2kSdIVqVsSpnkwjTrlMex1xvpbQFAse94+8oMfuDaiohFj46TK4ulnOGxWRxQynORnLqZWiw7ex4FZHeZlSlVoQankhUuepww2+6tvKPiiihuqJ078ss9TYEf7QAi+yLOAk+QepLnCe9oLgrZvziISP119s8yFNbH/Kzsg3PvKGJ5B5Q/1Qwr8PYXjjqUtNchBnS5Vc0H5jO2tCGxWsAPSY0XlT/l6mMg2vyf+VgrZqTj9A2VbYnC1orHg+0H17MBSNMJ5K9csSnTqyl21HGy7vtdfphkG4ECBv7+nJaPRwIbv2JdgEKID/sAr4b3NUjjEyg5riVLtlmdSiyvBM9YLhIMhBoaMYQYVZ/WlBR9ZBLJvku4kB13iQHlO3xD/vxaqaBCdzajNeTE90YK6n3RU8yrkYPVWjeIg/zNx+kG/2/AaHCxes9ZNqdtTJ3d/0D21Ysbbczly9p+1RtGb9q/CRYP0FZjkDNbbdrFICSZwCe4hXL8jnqbzzBVzQFg/H/SlpwXDri2cwfVPInW1Vch7VrB8QSFyJ+rw1Bi2zDi5BxwQb8gNGF4U4lHWNISFkz1Cyh/ZlAhz6ZWJzQUNLtJ4CpK7zniCxARQjL1OG/3ZJ6NfYqLUScDXPolwH6m1V2zOC9TeNnSvvlVjjEOnSIuFsEitc4BvD2yr7qJIH5cGVMXOZm68LcTjbwT1uOdxEx83iqjOU6gHFuxTSf6EqIvYSpXnikYIJ3AMaebEvQHq4rzUSCfSdx3wpiahRAB19hvZeNFw+xs4+NeCtWBSrF1dGDCA/pQwWDpBhcbxSOBMpO5sDeza8Cua1mKd8hp20o+crefC4pUpGdyVzXmIugIOPqpl5qu1u4G9aAo2Zd2jrTcQDKwlEV3eJsRuIXMdV7dPn62vEWM3UdI/GGS9c0LAK6jD6WUF9REtgKXseCKMcvkh5j4GTrezzQUr+MblZ7k8xGDwYhIjpYQfal1keBjpVr0hjfOiBh4O4+IwBlr//tvOADjQq4wDhmDVPAu58G9j4dovvaIttN1wq9+/KZxsoxs2sVUbuoCBLNGvzD2jb+nZEpVnOrwmJkKSgV2ozA52R5wbQaavZIzSjLOq4TGEhcWb7bvPAilnTF8BOMb8tpO+TTza5V+og1OmyHcncAVtvyUf9IMwPllTJz+TDStplTJ61Xd2noRocSHlxcy7kmtJNormlwt4UKEd+vMZugLLbKEkk92ZLGQAFDwFA6g+Uej5Tcl1SZxeeF5WW9Yi7wOxbEqO9KpxNWYgj7ktCB+R5qV+6p+3qUXoY4yKEoa2TPrR9zCTrV2ZKHN37UR+/3dsOxTDE9/vIgWwd/6pxOJailWXs2rYYz6IoNiiR3G4s6sHTqlEhb1M/TrAhAjhju9vLdQlwEphYrUvyu+sXt5IWxrSItsYcVxI5j/lRkQsyxJ/d1nLzaYcu8QyVlbyHXKHttYpa3V5QtN2X+N8zaSbek2AD4Ue7RZOR9mAUPnBRzZrQ7JnptiIc1wm2N7JW+YBuxhwhI5At1d+eMxY11AvJcVajk0yKqKWkICqwPAte5tIAJnu40TrywEYdTNbNPof4zB0bnH53pnkEqp1zGvz3VJhdkwV2ct4/70NbO7EXUbQqQxTBLA+/7kNHSHHG4YvA/6l7omfFyX8tfCl+d1dQJvTnT/h0s91bwvMU65CPNfuUrS/78zBJAgYbFRzEpUqa7Ej8Sc4wjX3Exij/rSnjUG/pIxaga2zMvsH9cfdJht/pQNkFaRIokDiBQLbw62noc1fk6FYp83we0X/GZlGOJyn/4yqzIOKvExqjXbAsFi3rLuLpDiXBqEWf7FWV6QMqAIhrsMSkWYKTjLlDZHsKcxRCtcN6yCwRFeDOJcmFzNeDaWF6zZffumGKCauQGzobuDC80rv659F8/866nat+0SO+cRfrmefgVF6xHuQbyjVZm58aKeitxbODd31PaUJzGu0XqVabEz3Lhu8nQr4JeLw0cAa6pWU0avQbMv3pd1CTeKnfCWSDdq5YiMnSLBoFxi9KWemDU8G3gj9xfR54g0SoMU6CBdSW7wKxuAVqB+ekJikBn+9Dw3ELfY+ZMuvrwkB3Ai+L1H/n4b7vUf/bGSLp6jFV03YhLZXpAaw61Buwh4Kb1F3XYJQTLjD7knKiC5khha7l3XdLt0yyNRrP4IxO07Sd03enbZc1IaAwlDcYdKde8EfrOqW5N1S9ELT5ddqoc1XsRa5CVWeq6wgCmrkc6Pa57yogzf861fxT5Urfh3tzE60x6QhyBYWkHO0k5WHhWSo0SE24AZKJklhNS3xumqZq7DGwYN5HPtCPmUhmg7C0X9GWD3XTcMJFgUfqf2p40srVv5vnq3YDcfln+OKg5Gz1F5iNqeC79GPLyQHj2KgUECP7mAIHXGoBdryeNAT4ONpHpnTdGiPqTah0NGl+bFSpDtXhLo8VifFB3Iq+YJf5Gkt8bUk5LQfCU8iYv/FKOc2h8yTucZ5Tttm07FzOP8TPje95o/n7WT0QQIP005rzjd6Wu48ZVKb71FHFFP3b3gEcaZXsp5O2xIQtu8iuQkf/Iz4O6vk4J3RPMxvbQfyzfUpFPvLn+7jIChdcN/I7sSgoMF0guKdgoDDerA1urXJv1vNXBV7OfT5Sv69Xjhgq/qPJIJ3f6Dci0lshHVifDWv44m+47YN/BuAG6MLy8V6A2sNrOdSB1v71W/6MFOtJZGo/Z04jpLXdXpp/AF41ERCG8YJ6FbJhlA5IizInC8Ekrywj5rX1HKlIrTvzUkEFzCxuqpaCM9be5ZDk1NDjcM9MRCjVjl8vDrLXgxg5hPIsH/OA4zMwi3Wg/3GpzADOcao1IjeiyFdd1wQAu8v2ERg58npnZpY9Y2u82T/ioUHmT43miUeUyUA8YpZyn9aA2C3dIjudka68F+uWYcCw4jm7ybLJfcuH+5IdJuwrcKGDoZ+fHezjyAldx4YIoYJqj6s77H78lcJwPzXH2ZmcbouXsAacKsjASbS6l8e68eBP7w3qBiw8cyHivvgT8kLLNPIVNCYxBlaxF9KUx9jX6t2UsPfcIbiSHhGX1K0l3oekiSDXw0mkSSpn5EE9iEYslg94rjaJ+DsUNajdkwyI6YiC+gn/zN4oI7UkNWrC9oLaVB2wv3ZuYBMwBq19qMtC8B99Hy3NWXBVoqZjWilJR0XWEW6TO6CgQNhesW3icOPZ168oYbER5jjzeN5bmHQxNmx9G8wD6gI2GHkTEcUQBlZRgMbp6+y/svUMfpLBhP7gCxJRIMUOaqXKgaAH5FZTLurdKB3sNKvFSzAhR+iaFPnJuSxOuUBJxfKdi2BbWL/YtCIImfiEFe9NePFuWOwtznBerFKdmvZIl014iKfokiX9tGMvvZLgppzQkKcnLEZdDsJZMV+4+yVcB14uea2tAl4QJ9xH/BCloLyx08OuVJOtNH15k0tUblq/d//hdYOXZBkIFlF+gwxL06YwWjcQq+eQHfVyDsnov7a/4PyI95DyzhZJfM6eSNqxqitNK9oiXxsOrrW6wGNAIGfCPbTqvgztz4rq64Ek0soQMKl8HRCZ3PWNx/jM9ysDM8wZJVSg1oz02+6OCEnBTNECt8PGPQ7lG7GryJxRxDdh+u+o73m8Ck7U3dw7xVPqmYVLZbikOelyHhsLuINLvCRZoVfZGqMP+K80TH7ztXBkwuytoqYDbmNKhOT37iM2djCx6VIAaz5+sXvMNz8fLwmOH+a+7GDib1HrSARIxyfOHlSC8pdx1vM0J7oJlz8hs6UbvKzV+PMS0UW338h1W4Vg2gFeQyYFs2Zlgy2geuimrIAgMAAMfbdh3nr1rew8u2j6J9ap9KEZyfDbPRAaszSPppvEAVjd3RqLc0wIDEOvH/NuIPjc5S61LEN2R/U056tSHWgLGcHmAHqVepLWLOnmRIAfogk1Tip1Hf3YJSMCsS5wmVqf2ZKLeH6/b6MFs0lGuf8eMQYhXjjGNDhJeQvQxsjYHx1TjsFCv6YO5q74+8SGYz+rVUaMdgwMrYz9A2gbA1mY07cDUY471r2QRupntyoC4IzUVGakkKbSEEi3DfFqtbmr9zQ58MsM5dvoFNU4zexcNziuEDAdmJhPcinzFm82XyZFRyqt9A5lx3Nwohaq+GKtRhSP0wBUN7zdb/9vYlmQEENt30fZpIeu1zbVbrc/y9NUFzVc9Np6rvujlj4/F91WnmgGTr6bknMHkH3xUBhbHbYldAeihtb2AuZoVauYdO08KVwK+0+rANEFWx7jmUvqyXc1LqPEkjAiw6LGFOy46VZR+TCN//DbKAvwdmzChBM9Asz94k6PTpQ0HcMBx+0OomMG8bLT9LLNXjipP21qGuyC8wjtyDYyVTeqkN7SKsW8V5sH59gZWEYO3LSgnOVqEvfvWL06iT04f66oVZEK/4+4W89No+31e96BCXZCeefjs7gZrjMfWrX+TrIjvkTP8Y13ctO9J7qfG54inPcAEv/nor+aURDAwL1WZzHc8QDMe1wRTHIgI56BkJnvGvGMBCXZkNXjEyW6mFFq3IudJqTqtiDXuPXJ/6QuuR3SQpI0ajV9S5MSYOMsXMyu8AChAS4VWPaLrOaLhc+uwJ7KOVq0OOcHoWWmxYl1pv0YE4KvKIfiNWjQ6cFCW4q17dHUDLHFd/LiTUrDHEtp5zj8dxCRP2cOFEZ5/HAKx1KJXTEaRzL45uBzH/Q+yxA7r3pdVBMkWXSOwuKrSUpeRMLt6/guf0j7kf6zQKKa3x5o0Q/fSrq4Tzhb64eNPgBeaBsKo6dCihTPxDZ2TOr0gEotnMk7cfjoULNu8siiczVZQjVk1EKPKbUqe3vqV8mkoIIvohzQgx3/U0TfEBFiXwu5zLxUpZg36f5DbjOqgBPqhFQ7Z/Wuw2lRgxYO4l/IR2CjjCvRSBYB7vJrdGplY0wrBjQ/vX8s4E7r1DzgIdwQvLr6eDmpDCxxtoXv1KS8er9WvBh06ErcAttrw0fiATEP/ui/fAL/4hvrRSkCPtwsxY+BiNbfok0GH2H4XbcuNMP6FSzDhylS9y/SDGyIqHWUfIYbJkCr14ZxI2Y/m7HmGBXVQ/4nyMPE2grG94X4T7puHkT20jAmU0dTZB9J7P/g17HPjioFjDPYgwn3sx42ZGYwlgwOTFOTrHfRpfPmLMPqBqCrl2RM3K+NTBwvt1A4y4QxwEbPODzobYkI5uiSQCYAYfh5Ddkfs62uOL0GqkEbzN+WAXqvzUSb4dehAnm7CwFZtfHsXQuGVSFkGmVCNzrLQO8zJQqNMyqMztLXzuaBF24UDIraFPM+9iO+mH9qM4EOpczgjbIu0mkz3hU8434YjCYFQFe1NW2krvTkTwzp3J8YxSF6Ujp8oK1KH1dMftVzbl7LMx+hM27jv2cVlpNgzaaI9lJz/UcvtOMo3JZksOw6BtJANB2AECvUhSGB1XCptjwv/OpCaN8gz1k48ahbKCmJWulhqhMbn9rVQpJaKuc8Fc/wU6lMsntQBFN5nbXky7+pAddoH3ZqzKJ/O/TVe7Ggh23DIm6z9qymhQyM7CcFk3ZDCaOCkCgtHX1nas6rauRUZd1rAfxTsaElkwfCdg1u1yRARjOcqvqR5XEsrn6YIJ+nTtpAKr+JgJlAF9tmdLo9Gk0Xti7bSubqyhjxbP6anfiP7JnZ/m15+F1IjGwGDfxjs/c43jRyHH7EatcFxdOr3um2K492zwUGes1o79xZbmzcdVq4aqt7+iWts957J80bichtfdxgKDCH99gB6FW4L2orQUbzScR/LDzIpTjZScOuw7M166IH1HXfF/D4euKSDIBTlErP5HZUxiKp/tPpcEdncNsvom0DBzLQ7vudugALoZdVUiDtSleolvrGBZLxLkLjJu4yIAr/aCjfg9fszqg+8oZKh0jBnlMnPQL1PlpDSB+EVcDYesPElWmjjuw7WFL802tREpcVZl8mgVu/vcIxpFEkTi13soEOx0SOxXoMONFFzJZqUjQGliPl46dKcN4dab88piB8kOCviIX0XCZqlh3svocdQEBu48DaE4v0RsJw4sG5UeZ0dCUsiQbhK40+JBiqklm8smyhKFhxCn+xV1/DiRTXcp7uwTWzAtVxaY9yMlWfos5d8xhRCgElkvHFXhxHUmCIul2IjNHNskNHADhDsZngmW8IOj1Etbsi5xohPBbrrW2ZW/TyY1aD9S2ye/ti03tsatUBrLaBvvyAhDlWPGH2f+cZsCNLV3JBpydbEcyV8jqz2RwXLz6+9AVKhQuoCnOEMm2WXnm5EQQqI+5JRoAIIBXws9WAOEkMPfFvENhdBYhKI/+3T6f16RzqdGqnD5Vv+g8WvNN+Fmeflkd+rP6FYOrcLwggYmND4FM7izesDC4EgECyWfU/OwON6s79Fj2FcsPFoLoBUqI109CGHaW8ujJv9/+9koR9JnCR9X6ce/xtANU3Jk7qZ3yaHnofFR8qVmfNh1Vxgu0z/F1hEK8P8IcaKp2DXyIT5RyxWqHVje8CB11uL0RNn1NDtNcUPRSfh95Y8ujcNm+ek1ohF26EFQ5u4Ng+ZuroJKltZga0TGV26u5Jo6k95rZNeDWL77SXwyioJmYzNC2hG7/qsXuA15r9Wd6vIAYrLRu+GB6Puygy7iK50CfGPYnnOjstGdPonvUKvpa/xK09WzhPm4yTeXgdNe0poh1tSJCufV4HQ12FmvDoN2dR3cl0Dn89rtew50C136hATxS9jaswewmxi20WSuVFHAuWnFPj2O35byrlMgE9l9+p5Tb2WZERW4xYGbT+wXh1DYEnbeSQCtCgKnYv0iYF5RKFe297UUPlB+nIMdnZGuVZrVlzIgbl1IYIMkk24/PNuU3bLxCtOL8O9PMhK9ZddOhnMxigBFh7CavmAWb5gLpEtuRpv4tWRyz8se+NhxnKFopGX4EIRrxlXrb2AreDKGiN/ELsncP/WgA7UxnjQ+P/KpTyKajH1Db5NDilRwJ9nBuEncoBdnGPzpHkRTKhF8QZFOvuuJG32cGSkqpn+cqZ9Thn/3EZEOC9GM5ykQxHbMgDsm1U8Twe4h3VKwnQ7wQOzLUkquQfJS4KBfVWGGD4ioV2oXrLtOvnoHSc1BjC1k0h2aDgVk92aiMrUz54vX52vVz+wTnemQuRsnXzu/zXt+9ksYUmzRvpRJh0P6tGIso+wl8d1CAgHSG86H2ipMokXz1q+X8pjVWzU0Yp8c72EN++J1Bi/r1OtqFcVaHg49PcEmqJi6y9PSNMM8nTVHR1u2k2poylhu/NYuaZ5ptjWuqvsOJGoHZIaytZTD6synI41KJ3kI4yVZeXaHiwafB+9ZO1PfQ9icJW/T7jw+bymRMvIXAA+JNE0iVD//C8iFKdnHIhsaqSzmBCkV7n8ONmZxPk0SEJLPSDxcwchyNCQT3jFYlFMvYtLBrwyKa6FbeWuN8jVmeTcC6Z26Qab0E00JhMICwxtX5crkt3VcqYFwG4bUTXA8Wum/LkONKIxGm2sJKLOLjTagrYbfk/gx4z4cTzRqII1QOdfnmNSJMnljKIp+hO/+JYR6E6tH6hUiAhBoN4ApcPtEt2qpzr77kMAIsv55+8fGloNIh8kPMXwyoYyzVKK/gN64ltGWzvweV5WONaFCAAjFFv16UK84ZNZ6AV8j8wA39NhtMabKCs3GbwAb7ezsBROTLOObHJlBDlJWekCbIZ9FviK7Wudp6lflNP5Uml3nt+FAOVLagN3hNGuR1avVUE93EKN1p4Lb7nzaOVYyw2vOrHPFy0z1S2LS9jlOA26JoN6+VLCEIr11PaIVzKU9nBu3tYlQNydrEXKXng++BxoYUEwOGR2/nopBYSZt5YsiPCFTw7ORdVaxv76rckGPs6Ft+k9JXEZqXOg7HA4102kvrwBaqyNhOKO/0mT4dxgS6C5R+Z6f3HMzwDg1u3QqQENWis1hCQGGsh11hRIjjvMJAYQong2cclQu+psmxK5fcWb5etuiklNYzv9qskBLa38cGFchWT2mhwcCAxiTwJz4l17HP/2u55Fn2N/2ACbOrelBIKE/PE1wU44KLHxkEpLUoPy6bNLg3MV5ZuEhsGd12VCJTa6PW8/Y0FQJoHlk7f8tKXGQQha+JcIdRuDAZhpxFHyy5EkyG5Tm3pRB8EWMbRQN0tOEXYgO/mTsGjC4qmZH0CDvMwjxXISFnM/+ujPLTNyGjW8yuGkABRd5EZWFAnv7Bfq8Sw01cDBcFgo4k5oXEZkFXy6d6BN4xP8KQPTCXYtFBS+XcNlwrJ3eOVtMm0TJvVnEoggY2fNGz3euYS6q+2O33LX+HvBWr31D34m3GYxShwHe4C7IAlRdzwYbbz8hwkZiDmWa4ajUSj6GXk5dXfiTVJaKjAqWmnKIlQDju/o+bCkx19TQUK5wUXUsy7/I7DB1RoMJCT4dDL7TyVbJEcTf4BTPze5qbUwxONy3kGwWctddvrKFkO9PWoHTGZvJf18GnbdSbmnPoxPnd90CpSYGfQgs+jBYlVqjEDXL3uhufpqEdzKKZRgyueabCIDW6YaVewVL76fv8uP8kXVd+s3eI5qF1dN6zqbuTzQoWY9FC4QHPUSX2doqOywXRho6Dh7tJOBP9TyRpIDzfpqysORuM6pypKKzylv6Zlf2icRywICuRPFm7DjZpJG5ox6kS4YlQ3If4yrYr5Ofuu7268xT+IrmB3fhlbCIHB+UDT118sVxyyvMXwiDbLtocqUOp+dIIYC48BkUkTrMXy/EDXKjLJEXyX12G3gn7Odn2d4in6bIQ6ZP/GMSBKPGr5QsNCX3P4jd1nSdF4oh4qVVfOmwrDHxRwInFEwOa6HBWzKMeQitWbI6dz+KRTcaJ738lM/Dal3/xuGR3wIr01gmy0LStUQiEQg28vflJX+/ZdWScs9ifj1j1LNH9zF3NHJ9/pPo5TiQanDNwjMyoFxhO2gxdQHOLN4XuIPEg12dyBEQjsMbCls4BU+51zJrDE4wJwbPKjI0QlTbxunnM1Hguw32EYcxpiK0ufDx91nV1B46Da/ItrClO56awtip56mYQEjbDtpi0IiwJNd/RZM7mQV4JME8mXHqXpCYRMpRjYDdN8DxKD67znCgCXSpvdjG/Grr3RXAUbXLtyVagsadAHTOvYg6xqbSffeDlNAau5lC8GlAmqI3goJ0U1kfQ0VkbWnSu90ryDkYaOOcLpb1Ik67HyUMSsGz67GvJLJcbIJo9MlxTNqjJoIGDeyUAkr/pvC+QFC+JBGx1dmKkngZ2/UeICzlDZ0xV85UDDRHQD3SH+XZYbW69OgxPuRgfk3CfYXv1hNrKBh/aLOmGb9WIsoGvBpcRbadS4v7gsgBPFW8VuM4IpmapQ65/S5oqJ2LUVaKp3K5RpCMp6r0fciq/oscJz/2W0nrcS0mMM8xcY8Hhj14sLI2mJcZF/RqMC96F5g7VV4iqKkUmVYz4JVlkcgp5822swURIYGA+ju9Hw17jrYcINOnmxtfzMY5W9c9tdnyt1BTw7lQcHGDLlZ0kenBi6u7KBLteaGaNfvYudtnMoz5NwU3JG1Kai/jmfg16i6BnT4/vAXyyzWdIntmnu3prfGG0z+7VMYj/TfAvaa7sqjW5BAaZ4c22kiLzgDacAPTj7P455/em/C6TOhA/CO9QPVN9Z0LrrQWNqgOppEu13LDScaKwWEmlBmx61tUjdUmxkfRpZoPnmrS5XqCDOmVSMmoy7FTr9bPreX4bVgviGRNzTfcWgaaJPMNmj1XWQPFo9Di74bU2g9SQif9Oe8iGgD2nHivx9o6zsyY1UTNFXHT/0x32fO/TXFMEx+adLz9QwAQ9lexFJ+kHSBZDZgDwQX+iLU5Yjen7FCoVi6XcjHVQZsQVs8jwNq83+VHne1YKXbgBbjDB4amfaPIeGWjU2Q2rsJcG/wKZ2qrUlPqhD/gBWM5uicsrb1Aka6O2rwXzT1/rD8+3nrOc7auPzBtgc9e00DeeSgN8gHPBDEp+W48WNphYLB6mo6YrfL1iGNC4vmC1fLYaEvRgA0PGePeq8MBhEs4Z+M415De4H4qP7IoBXH5Qxsrcygb62PtLpjegohL9ljG6Nui/I/EDHzK6hZFB+LdW2TPaW2bz8NsLiyZl3xpZmzXT6MO/x4IvcBUggJQyOcZbUzbXy3ErILL/APq8UMTfLPmwCbhJj0O7l9p+dE5sfLlKhiZ7VSQq5/iWjDY/UOnSgc5ArQ6FGsmcfKuNuF5jvNIp1iYb5KIx45qhDUqQ7+QDcKhrt0cd0VUP7eqvTYH2B5Oxrq5q4o3iXMlNXc1QmK2taRErogikX0e+sjfBlDig4hIYe9lHQ0c/30FILv/bOsiX/aw1vWlE6CPi2IjpXTJEAOCC3Lc/eHXewRl8xisG+3yiIP3yD3v0MamGpCHB6dXIxRmvCXH40QyYtbLHI3ORySgqL+jphnVo8jjYp9K3Sq6rS9sS8HfT9y7UCBAGZEK4ZKfLljmFHf0dfIkki+ri+7S2E9ulH3w1wyN6Uw553cm+ZF69mnvAc3OauFV3D3OGsg4/PbCphmAmHCitHPu1+HeRfYlg8AQUrRfOlqKQ45yMP8vae9R8oZpVyxFq6GBJxzXsrVRdLwTnJo0URtFelQnU7zuVic8a2wWk2U/OQKL2iJK/VHhkDGsIVw48RFQIOkmOwZDUefrKC9FChPrUCYykNPmZzlLsAmaCJ6TWQq1hDqJkBgWdnKxDBQ/0/w76L9psk4SuYf0+4Hbi5BiSC1KMAJXafm7/oBX33p9VMOtp72DocrNONOnSKvVmkXeZ6m+uBCugURdDpF9vN91CEEwav0GZrp1k6txRiryy+m5yslud3aocovfwhUsKDy9OeeKl90xlsf0uamhJCRVVRkgCAyIY2yJL/v2X3fNLB7HHTiACfvYDKJnJiL1pEkx9y9l0GMtZJwuwvYiOcP++2PKSB7G4EkLsRIntxDjfEVZk716rIFLt8dc6Tt2hGR5ACKqDoH4MIfEOkh4NYeLNUNwCPeod66cGtQr4ECEVb27pIkUsVCD5i7VUezEOrGiPa1JU0zRsFCbCA7PcffCenyMdwfnh2yRfZK4/iEZIIWYPljip/G5rCU7i7CcZdJqc2GJt1VGlco8n5cSUmwbnrTYx7xDHZ2oUoX1ufdsXfcVcc5LRiyytPSww31nAKHx7cmiT7Wuc6p8w82whZuwRlvshu4pAOZTlTC7N5RJvuEVieWTULxueNmFFYIDyhADnb24OUHqUs5HHZQH1D33rmITjG3h+adOburho8v0h/w34QfsP4wGRvhHD18foT++mjGzY2LNsC6dDRauCSsL+mvM6PzkVrBY6G8SJBV3LseelmSvdibCsWFcy0HpcUQlM8t2IBDJwznWkmLKIELdksXFRjoOji++I9zH9FlRgKFRypwnrEW4iGneuBSgwbncvYf7eIQZ12CRExuPpscvIJtdinoPX2a9UoER8fqQgjzmAPGVnj/3BALv3th+2b9CEbQC8gLHhArbw+uQ6wjNKque/aJbIDsb8w+1xDbTyzjItaanJC4KDA9lOWaEcroSYBBH1qAKsZycDIZ1PoU3mHqNSosLl801nJFg1xuT3QrKlkUOlzyju/jucnk55OqDhrr/E5MY+SlzGwRa5oU6zQUJpUfn30NuG+wgza/Wn2S8Mf3hO6Bp/XLXIVZLbabW7XNUWRI0NkXUhb21KNn9elfI55B65zV5KQ6y6QKvoJEi4YwSJNSR+iPxwC8Bmmhy143m2ey/w4gBE71hRGcW/Z6GVICUi2ryjRVfHSAUn/9up0+P40JfJMtZF9Jx6fmKeRgXAL030TydTD+MvZR6TvU+a8KYHjQ5IGNeU/Ub1/y420pbak8Tr+hafFBI6ctM6w/arf/xFZVULZuhhvCTk8J2Fj9U/lTLIO94SjYi25N3Bl+/bXsOiQyIUynePHxvm4TjmiInLmtvy0tJ7wr5cVb5opgsvvN49BzAEjawp9Opt1IuLf7STkLQzQpj/cRiQxff8TH6GaA2SiBbztARRpGFTkt5PnOkAYye/u82FBmr0ILM7YeZpIIp6Ur7sdoBu/uihZIMgssgPyQfhyPDYfUOgKj7zMIyzS9s/novN6ihNoxm3fG/l+Qjlgvw/dpWB3q5oekS6bYGkGqCb6oEE2LjIdarQiLAj1cQPdi0CPwRBu4mpkH1HzT3kT5qWms8CUgnYtMFv6LtLNYLtY8mru2r+YDoaaVV3mgJCl9xMw8+/xx1SKyfeznFfD+lo37RMdqy16AbIRyMwzwZbaow63LWSf/07kYd4BodXzg8tRJVChc0/e9YWuTu+TD+/KXM+eQiRWHFqjxx6ctjM4XRBPt7ew7VvQbkVdjiUu/YDHWSsxvzReu3MK+NNhzpmvuBe7S4bVUBej37NKSaUtbPgXhtXUdKWxJ1l1bJjBW4jZcTNmcoLUJRNE+MoeIzcUT/dUF49Dy1kNagNdo6H70IJXIHe2lMHWS7ZNG4SPQdFVKGP5Y+NB0gkI7VsGTcfuKhYXcXCqwGn3Za53XUN0WfVrQmw4Z7s1mCqCw/PAyL4m/0xAe/ohv+s2BuB11xrdiUYULTK+oibU0OFKQ/ScwwX9ZfTsvwJJJ1YkbCpkRGlbyoD2j/0U0GFM5arYChHKIg5YfvyySNXPDTFDwcZnXtC11l9d8GioOiRTRuHTQmU/P14o2mJ/wWbNlsqmoKt2Njpd5jj3tC0XG2Jh0RtGYAVFfcr2XAVuAluwxnmp73mrnsQNuOCA+aSYGT1DcwnQYDmPkA9b/L5EIJzQVsKItF36tBKPmwk3OOTshORQWyk0Y7EpKZyY0/6qaiKmjO8RQT7rhxGSExathuc5PCeWwO3sPeFf7IiFeoQk3pt8NWCTJhpmnGEzzHj9gdiYPg4F8y3/e1WJXS3ZIjNca7IkTKA1KVUQDeUIf7O4yd7cmdDPwB0BrARh3QtPxmDzyj9n2Z+I5BrM4BCMF6jKqfH5MmmqADwvR2WI+MlyGAprWEMiiwVyU+f2KzSdXjsNJ5GAgnpWxvH/IIepZR1u9M+L8pDEZByXHyqEIeJOIu95+MLCuA0P3YX1PCVgQmImoVA7AvFXTeWfZ6MM5FIqRzX3t8Qka4M6330TmsG9KntgtTyyqwYS9Ez+k5bdXChs6+/q4apg2Q8xO130nIxIYhx+izW3J9yUGVWPuNw2ain9y6xf0ogvL0sTAP4oKcsSRiige20/b+8CnL3fmQPSxDuPirKO3yDnZOzKGCOqS0qg5LGHSlYAgwnAf1IRG/YqwVHC3Gxg==";

function base64ToUint8Array(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/* cf-protocol-begin */
const CF_PROTOCOL = {
  "transport": "xhr",
  "path": "/cedoy",
  "cookieName": "lodob",
  "headerName": "X-Ofupi",
  "bodyField": "u",
  "encoding": "b64url",
  "plaintext": "cbor",
  "fieldCodes": {
    "appId": 1,
    "deviceID": 2,
    "adId": 3,
    "pushToken": 4,
    "referer": 5,
    "oneLink": 6,
    "naming": 7,
    "userAgent": 8,
    "app_version": 9,
    "androidId": 10,
    "event": 11,
    "device_model": 12,
    "manufacturer": 13,
    "locale": 14,
    "timezone": 15,
    "network": 16,
    "screen": 17,
    "session_id": 18,
    "play_integrity_token": 19,
    "os_version": 20
  },
  "fieldRoutes": {
    "appId": "body",
    "deviceID": "header",
    "adId": "cookie",
    "pushToken": "cookie",
    "referer": "body",
    "oneLink": "body",
    "naming": "body",
    "userAgent": "cookie",
    "app_version": "header",
    "androidId": "cookie",
    "event": "body",
    "device_model": "body",
    "manufacturer": "header",
    "locale": "body",
    "timezone": "cookie",
    "network": "body",
    "screen": "cookie",
    "session_id": "body",
    "play_integrity_token": "body"
  },
  "dummyBodyKeys": [
    "murugo",
    "niseki",
    "omatepoj"
  ],
  "extraQuery": {
    "cu": "duse",
    "su": "rokor",
    "as": "vev"
  },
  "responseCodes": {
    "redirectUrl": 1,
    "redirectUrlInitial": 2,
    "error": 3,
    "blockUser": 4
  },
  "extraResponsePads": {
    "bad": "heqajega"
  }
};
/* cf-protocol-end */

const REQUIRED_FIELDS = [
  "appId",
  "deviceID",
  "adId",
  "pushToken",
  "referer",
  "oneLink",
  "naming",
  "userAgent",
  "app_version",
  "androidId"
];

/* ============================= */
/* PBKDF2-SHA256 + AES-256-GCM   */
/* ============================= */

const AES_PASSWORD = "84HIgRwJjWlwCMduk2SXIZHow4JW";
const AES_SALT = new Uint8Array([
  0x7a, 0x4f, 0x2b, 0xfc, 0x77, 0xd4, 0x08, 0xc8,
  0x4a, 0x87, 0x41, 0x6d, 0xbc, 0xd1, 0x4d, 0x50,
]);
const AES_PBKDF2_ITERATIONS = 100000;
const AES_IV_LEN = 12;

let cachedKeyPromise = null;
function getAesKey() {
  if (!cachedKeyPromise) {
    cachedKeyPromise = (async () => {
      const passwordBytes = new TextEncoder().encode(AES_PASSWORD);
      const baseKey = await crypto.subtle.importKey(
        "raw", passwordBytes, "PBKDF2", false, ["deriveKey"]
      );
      return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: AES_SALT, iterations: AES_PBKDF2_ITERATIONS, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
    })();
  }
  return cachedKeyPromise;
}

/* ============================= */
/* base64url (RFC 4648 §5)       */
/* ============================= */

const B64U_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function bytesToB64u(bytes) {
  let out = "";
  const len = bytes.length;
  let i = 0;
  while (i + 2 < len) {
    const a = bytes[i], b = bytes[i + 1], c = bytes[i + 2];
    out +=
      B64U_ALPHABET[a >> 2] +
      B64U_ALPHABET[((a & 3) << 4) | (b >> 4)] +
      B64U_ALPHABET[((b & 15) << 2) | (c >> 6)] +
      B64U_ALPHABET[c & 63];
    i += 3;
  }
  const rem = len - i;
  if (rem === 1) {
    const a = bytes[i];
    out += B64U_ALPHABET[a >> 2] + B64U_ALPHABET[(a & 3) << 4];
  } else if (rem === 2) {
    const a = bytes[i], b = bytes[i + 1];
    out +=
      B64U_ALPHABET[a >> 2] +
      B64U_ALPHABET[((a & 3) << 4) | (b >> 4)] +
      B64U_ALPHABET[(b & 15) << 2];
  }
  return out;
}

function b64uIndex(ch) {
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90) return code - 65;      // A-Z
  if (code >= 97 && code <= 122) return code - 71;     // a-z
  if (code >= 48 && code <= 57) return code + 4;       // 0-9
  if (code === 45) return 62;                          // -
  if (code === 95) return 63;                          // _
  return -1;
}

function b64uToBytes(str) {
  const normalized = String(str || "").replace(/=+$/, "");
  const len = normalized.length;
  if (len === 0) return new Uint8Array(0);
  const outLen = Math.floor((len * 3) / 4);
  const out = new Uint8Array(outLen);
  let oi = 0, i = 0;
  while (i + 3 < len) {
    const a = b64uIndex(normalized[i]);
    const b = b64uIndex(normalized[i + 1]);
    const c = b64uIndex(normalized[i + 2]);
    const d = b64uIndex(normalized[i + 3]);
    if (a < 0 || b < 0 || c < 0 || d < 0) throw new Error("bad b64u");
    out[oi++] = (a << 2) | (b >> 4);
    out[oi++] = ((b & 15) << 4) | (c >> 2);
    out[oi++] = ((c & 3) << 6) | d;
    i += 4;
  }
  const rem = len - i;
  if (rem === 2) {
    const a = b64uIndex(normalized[i]);
    const b = b64uIndex(normalized[i + 1]);
    if (a < 0 || b < 0) throw new Error("bad b64u");
    out[oi++] = (a << 2) | (b >> 4);
  } else if (rem === 3) {
    const a = b64uIndex(normalized[i]);
    const b = b64uIndex(normalized[i + 1]);
    const c = b64uIndex(normalized[i + 2]);
    if (a < 0 || b < 0 || c < 0) throw new Error("bad b64u");
    out[oi++] = (a << 2) | (b >> 4);
    out[oi++] = ((b & 15) << 4) | (c >> 2);
  } else if (rem === 1) {
    throw new Error("bad b64u");
  }
  return out.subarray(0, oi);
}

/* ============================= */
/* Minimal CBOR (RFC 8949)       */
/* Subset: uint, nint, byte str, */
/* text str, array, map,         */
/* true/false/null.              */
/* ============================= */

const CBOR_TEXT_DECODER = new TextDecoder();

function cborDecode(bytes) {
  let pos = 0;

  function readUint(ai) {
    if (ai < 24) return ai;
    if (ai === 24) {
      if (pos >= bytes.length) throw new Error("cbor EOF");
      return bytes[pos++];
    }
    if (ai === 25) {
      if (pos + 2 > bytes.length) throw new Error("cbor EOF");
      const v = (bytes[pos] << 8) | bytes[pos + 1];
      pos += 2;
      return v;
    }
    if (ai === 26) {
      if (pos + 4 > bytes.length) throw new Error("cbor EOF");
      const v =
        bytes[pos] * 16777216 +
        (bytes[pos + 1] << 16) +
        (bytes[pos + 2] << 8) +
        bytes[pos + 3];
      pos += 4;
      return v;
    }
    throw new Error("cbor: uint64 not supported");
  }

  function readNext() {
    if (pos >= bytes.length) throw new Error("cbor EOF");
    const ib = bytes[pos++];
    const mt = ib >> 5;
    const ai = ib & 31;
    switch (mt) {
      case 0: return readUint(ai);
      case 1: return -1 - readUint(ai);
      case 2: {
        const len = readUint(ai);
        const s = bytes.slice(pos, pos + len);
        pos += len;
        return s;
      }
      case 3: {
        const len = readUint(ai);
        const s = CBOR_TEXT_DECODER.decode(bytes.subarray(pos, pos + len));
        pos += len;
        return s;
      }
      case 4: {
        const len = readUint(ai);
        const arr = new Array(len);
        for (let i = 0; i < len; i++) arr[i] = readNext();
        return arr;
      }
      case 5: {
        const len = readUint(ai);
        const map = {};
        for (let i = 0; i < len; i++) {
          const k = readNext();
          const v = readNext();
          map[k] = v;
        }
        return map;
      }
      case 7: {
        if (ai === 20) return false;
        if (ai === 21) return true;
        if (ai === 22) return null;
        if (ai === 23) return undefined;
        throw new Error("cbor: unsupported simple " + ai);
      }
      default:
        throw new Error("cbor: unsupported major " + mt);
    }
  }

  return readNext();
}

function cborEncode(value) {
  const parts = [];

  function writeHead(mt, n) {
    const tag = mt << 5;
    if (n < 24) {
      parts.push(new Uint8Array([tag | n]));
    } else if (n < 256) {
      parts.push(new Uint8Array([tag | 24, n]));
    } else if (n < 65536) {
      parts.push(new Uint8Array([tag | 25, (n >> 8) & 255, n & 255]));
    } else {
      parts.push(new Uint8Array([
        tag | 26,
        (n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255
      ]));
    }
  }

  function write(v) {
    if (v === null || v === undefined) {
      parts.push(new Uint8Array([0xf6]));
      return;
    }
    if (v === true)  { parts.push(new Uint8Array([0xf5])); return; }
    if (v === false) { parts.push(new Uint8Array([0xf4])); return; }
    if (typeof v === "number" && Number.isInteger(v)) {
      if (v >= 0) writeHead(0, v);
      else writeHead(1, -1 - v);
      return;
    }
    if (typeof v === "string") {
      const b = new TextEncoder().encode(v);
      writeHead(3, b.length);
      parts.push(b);
      return;
    }
    if (v instanceof Uint8Array) {
      writeHead(2, v.length);
      parts.push(v);
      return;
    }
    if (Array.isArray(v)) {
      writeHead(4, v.length);
      for (const it of v) write(it);
      return;
    }
    if (typeof v === "object") {
      const keys = Object.keys(v);
      writeHead(5, keys.length);
      for (const k of keys) {
        if (/^-?\d+$/.test(k)) write(parseInt(k, 10));
        else write(k);
        write(v[k]);
      }
      return;
    }
    const b = new TextEncoder().encode(String(v));
    writeHead(3, b.length);
    parts.push(b);
  }

  write(value);
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

/* ============================= */
/* AES-GCM glue (bytes <-> b64u) */
/* ============================= */

async function encryptBytesB64u(plaintextBytes) {
  try {
    const key = await getAesKey();
    const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LEN));
    const ct = new Uint8Array(await crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, key, plaintextBytes
    ));
    const out = new Uint8Array(AES_IV_LEN + ct.length);
    out.set(iv, 0);
    out.set(ct, AES_IV_LEN);
    return bytesToB64u(out);
  } catch {
    return "";
  }
}

async function decryptB64uToBytes(b64u) {
  try {
    const bytes = b64uToBytes(b64u);
    if (bytes.length < AES_IV_LEN + 16) return null;
    const iv = bytes.slice(0, AES_IV_LEN);
    const ctWithTag = bytes.slice(AES_IV_LEN);
    const key = await getAesKey();
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv }, key, ctWithTag
    );
    return new Uint8Array(pt);
  } catch {
    return null;
  }
}

/* ============================= */
/* Helpers                       */
/* ============================= */

const B64U_RE = /^[A-Za-z0-9_-]+$/;

function clean(value, max = 2048) {
  return String(value || "").trim().slice(0, max);
}

function multiDecode(value) {
  let raw = String(value || "").trim();
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeURIComponent(raw);
      if (decoded === raw) break;
      raw = decoded;
    } catch {
      break;
    }
  }
  return raw.trim();
}

function parseMaybeJson(value) {
  if (value == null) return "";
  if (typeof value !== "string") return value;
  const raw = value.trim().slice(0, 4096);
  if (!raw) return "";
  try { return JSON.parse(raw); } catch { return raw; }
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : "";
}

function cleanUrl(value) {
  const raw = clean(value, 4096);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function buildCodeToName() {
  const out = {};
  const codes = CF_PROTOCOL.fieldCodes || {};
  for (const name of Object.keys(codes)) {
    out[codes[name]] = name;
  }
  return out;
}

let CODE_TO_NAME_CACHE = null;
function codeToName() {
  if (!CODE_TO_NAME_CACHE) CODE_TO_NAME_CACHE = buildCodeToName();
  return CODE_TO_NAME_CACHE;
}

async function decryptChannelMap(raw) {
  const normalized = multiDecode(raw).replace(/=+$/, "");
  if (!normalized || !B64U_RE.test(normalized)) return {};

  const bytes = await decryptB64uToBytes(normalized);
  if (!bytes) return {};

  let decoded;
  try { decoded = cborDecode(bytes); }
  catch { return {}; }

  if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) return {};

  const lookup = codeToName();
  const out = {};
  for (const k of Object.keys(decoded)) {
    const code = parseInt(k, 10);
    const name = Number.isFinite(code) ? lookup[code] : null;
    if (!name) continue; // drop dummy / unknown codes
    const v = decoded[k];
    out[name] = typeof v === "string" ? clean(v, 4096) : v;
  }
  if (out.naming && typeof out.naming === "string") {
    out.naming = parseMaybeJson(out.naming);
  }
  return out;
}

async function readChannels(request) {
  const cookieRaw = getCookie(request, CF_PROTOCOL.cookieName);
  const headerRaw = request.headers.get(CF_PROTOCOL.headerName) || "";
  const [cookie, header] = await Promise.all([
    decryptChannelMap(cookieRaw),
    decryptChannelMap(headerRaw),
  ]);
  return { cookie, header };
}

async function readBody(request) {
  const text = (await request.text()).trim();
  if (!text) return {};

  let blob = text;
  if (!B64U_RE.test(blob.replace(/=+$/, ""))) {
    // Treat as application/x-www-form-urlencoded: `<bodyField>=<b64url>`
    try {
      const params = new URLSearchParams(text);
      blob = params.get(CF_PROTOCOL.bodyField || "d") || "";
    } catch {
      blob = "";
    }
  }
  if (!blob) return {};
  return decryptChannelMap(blob);
}

function takeField(cookie, header, body, key) {
  return cookie[key] ?? header[key] ?? body[key] ?? "";
}

/* ============================= */
/* Response                      */
/* ============================= */

async function encryptedResponse(obj, status = 200) {
  console.log("[cf] encryptedResponse (расшифрованное для приложения):", JSON.stringify(obj));
  const codes = CF_PROTOCOL.responseCodes || {};
  const mapped = {};
  if (obj.redirectUrl != null)
    mapped[codes.redirectUrl ?? "redirectUrl"] = obj.redirectUrl;
  if (obj.redirectUrlInitial != null)
    mapped[codes.redirectUrlInitial ?? "redirectUrlInitial"] = obj.redirectUrlInitial;
  if (obj.error != null)
    mapped[codes.error ?? "error"] = obj.error;
  if (obj.blockUser != null)
    mapped[codes.blockUser ?? "blockUser"] = obj.blockUser;

  Object.assign(mapped, CF_PROTOCOL.extraResponsePads || {});

  const payload = Object.keys(mapped).length ? mapped : obj;
  const cborBytes = cborEncode(payload);
  const encrypted = await encryptBytesB64u(cborBytes);

  return new Response(encrypted, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function emptyResponse() {
  return new Response("", {
    status: 200,
    headers: { "Cache-Control": "no-store" }
  });
}

/* ============================= */
/* Country + local blockers      */
/* ============================= */

async function getCCByIp(ip) {
  try {
    if (!ip || ip === "unknown") return null;
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,message`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.status === "success") return data.countryCode;
    return null;
  } catch {
    return null;
  }
}

async function resolveCountry(request, ip) {
  const cfCountry = request.cf?.country || "";
  if (cfCountry) return cfCountry;
  return await getCCByIp(ip);
}

function isGoogleProvider(request) {
  const asOrg = request.cf?.asOrganization || "";
  const asn = request.cf?.asn;
  if (asn === 15169) return true;
  if (!asOrg) return false;
  return asOrg.toLowerCase().includes("google");
}

function isEmulatorUA(ua) {
  if (!ua) return true;
  const u = ua.toLowerCase();
  return (
    u.includes("sdk_gphone") ||
    u.includes("emulator") ||
    u.includes("generic") ||
    u.includes("google_sdk") ||
    u.includes("headless") ||
    u.includes("bot") ||
    u.includes("crawl")
  );
}

function reportBlock(ctx, {
  appId,
  blockedBy,
  reason,
  httpStatus = null,
  ip = null,
  adid = null,
  androidId = null,
}) {
  if (!ctx || !BLOCK_MONITOR_URL || !BLOCK_MONITOR_TOKEN) return;

  const id = String(appId || "").trim();
  const source = String(blockedBy || "").trim();
  if (!id || !source) {
    console.error("[block-monitor] skip invalid appId or blockedBy", reason);
    return;
  }

  ctx.waitUntil(
    fetch(BLOCK_MONITOR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BLOCK_MONITOR_TOKEN}`,
      },
      body: JSON.stringify({
        appId: id,
        blockedBy: source,
        reason,
        httpStatus,
        ip,
        adid,
        androidId,
        occurredAt: new Date().toISOString(),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          throw new Error(`Block monitor returned ${response.status} ${detail}`.trim());
        }
      })
      .catch((error) => {
        console.error("[block-monitor]", error.message);
      }),
  );
}

/* ============================= */
/* Handler                       */
/* ============================= */

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/favicon.ico") {
        return emptyResponse();
      }

      const ip =
        request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-forwarded-for") ||
        "unknown";

      if (request.method === "GET" && url.pathname === "/dex") {
        const bytes = base64ToUint8Array(DEX_ENC_B64);
        console.log("[cf] /dex — отдаём", bytes.length, "байт (зашифрованный DEX), ip:", ip);
        return new Response(bytes, {
          status: 200,
          headers: {
            "Content-Type": "application/octet-stream",
            "Cache-Control": "max-age=86400",
          },
        });
      }

      // Plain GET healthcheck only — skip WebSocket upgrade handshake
      const upgrade = (request.headers.get("Upgrade") || "").toLowerCase();
      if (request.method === "GET" && upgrade !== "websocket") {
        return new Response("OK", { status: 200 });
      }

      if (request.method !== "POST") {
        return emptyResponse();
      }

      console.log("[cf] запрос", request.method, url.pathname + url.search, "ip:", ip);

      const country = await resolveCountry(request, ip);
      console.log("[cf] страна:", country || "неизвестно");

      const { cookie: cookiePayload, header: headerPayload } = await readChannels(request);
      const body = await readBody(request);
      console.log("[cf] декодированные каналы — cookie:", JSON.stringify(cookiePayload), "header:", JSON.stringify(headerPayload), "body:", JSON.stringify(body));
      if (body.naming && typeof body.naming === "string") {
        body.naming = parseMaybeJson(body.naming);
      }

      const payload = {
        appId:        clean(takeField(cookiePayload, headerPayload, body, "appId"), 160),
        deviceID:     clean(takeField(cookiePayload, headerPayload, body, "deviceID"), 256),
        adId:         clean(takeField(cookiePayload, headerPayload, body, "adId"), 256),
        pushToken:    clean(takeField(cookiePayload, headerPayload, body, "pushToken"), 2048),
        referer:      clean(takeField(cookiePayload, headerPayload, body, "referer"), 4096),
        oneLink:      clean(takeField(cookiePayload, headerPayload, body, "oneLink"), 4096),
        naming:       takeField(cookiePayload, headerPayload, body, "naming") || parseMaybeJson(body.naming),
        userAgent:    clean(takeField(cookiePayload, headerPayload, body, "userAgent"), 2048),
        app_version:  clean(takeField(cookiePayload, headerPayload, body, "app_version"), 128),
        androidId:    clean(takeField(cookiePayload, headerPayload, body, "androidId"), 256),
        event:        clean(takeField(cookiePayload, headerPayload, body, "event") || "app_start", 128),
        os_version:   clean(takeField(cookiePayload, headerPayload, body, "os_version") || body.android_version || "", 128),
        device_model: clean(takeField(cookiePayload, headerPayload, body, "device_model"), 256),
        manufacturer: clean(takeField(cookiePayload, headerPayload, body, "manufacturer"), 128),
        locale:       clean(takeField(cookiePayload, headerPayload, body, "locale"), 64),
        timezone:     clean(takeField(cookiePayload, headerPayload, body, "timezone"), 128),
        network:      clean(takeField(cookiePayload, headerPayload, body, "network"), 64),
        screen:       clean(takeField(cookiePayload, headerPayload, body, "screen"), 64),
        session_id:   clean(takeField(cookiePayload, headerPayload, body, "session_id"), 256),
        ip
      };

      console.log("[cf] payload appId:", payload.appId, "adId:", payload.adId, "androidId:", payload.androidId, "ua:", (payload.userAgent || "").slice(0, 80));

      const ua = payload.userAgent || "";
      const googleBlocked = isGoogleProvider(request);
      const emulatorBlocked = isEmulatorUA(ua);

      if (googleBlocked || emulatorBlocked) {
        const reason = googleBlocked ? "google_provider" : "emulator_ua";
        reportBlock(ctx, {
          appId: payload.appId,
          blockedBy: "api",
          reason,
          httpStatus: 202,
          ip,
          adid: payload.adId || payload.deviceID || null,
          androidId: payload.androidId || null,
        });
        console.log("[cf] заблокировано", reason, payload.appId || "");
        return await encryptedResponse({ error: "error_202" });
      }

      const upstream = await fetch(UPSTREAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": ip,
          "X-Client-IP": ip,
          "CF-Country": country || "",
          "CF-Ray": request.headers.get("cf-ray") || "",
          "X-Click-Token": env.ACCESS_TOKEN_ENABLE || ""
        },
        body: JSON.stringify(payload)
      });

      const upstreamStatus = upstream.status;
      const textResponse = await upstream.text();
      console.log("[cf] апстрим статус:", upstreamStatus, "тело:", textResponse.slice(0, 300));

      if (upstreamStatus === 202) {
        reportBlock(ctx, {
          appId: payload.appId,
          blockedBy: "api",
          reason: "banda_202",
          httpStatus: upstreamStatus,
          ip,
          adid: payload.adId || payload.deviceID || null,
          androidId: payload.androidId || null,
        });
        console.log("[cf] заблокировано", "banda_202", payload.appId || "");
        return await encryptedResponse({ error: "error_202" });
      }

      const cleanResponse = textResponse
        .trim()
        .replace(/^"+|"+$/g, "")
        .replace(/^'+|'+$/g, "")
        .replace(/\\/g, "");

      const redirectInitial = cleanUrl(cleanResponse);

      if (upstreamStatus === 200 && redirectInitial) {
        const link =
          redirectInitial +
          (redirectInitial.includes("?") ? "&" : "?") +
          "sub_id_12=trusted";
        console.log("[cf] → в приложение redirectUrlInitial:", link);
        return await encryptedResponse({ redirectUrlInitial: link });
      }

      console.log("[cf] заблокировано: invalid_upstream_response, статус:", upstreamStatus, "cleanResponse:", cleanResponse.slice(0, 200));
      return emptyResponse();

    } catch (err) {
      console.log("[cf] заблокировано", "worker_error", err && err.message ? err.message : "");
      return emptyResponse();
    }
  }
};
