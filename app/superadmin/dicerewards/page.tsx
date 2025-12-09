"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

type DiceNumber = 1 | 2 | 3 | 4 | 5 | 6;
type Version = "v1" | "v2" | "v3" | "v4";

interface DiceRewardRow {
	diceNumber: DiceNumber;
	percent: number;
}

const versions: Version[] = ["v1", "v2", "v3", "v4"];
const diceNumbers: DiceNumber[] = [1, 2, 3, 4, 5, 6];

export default function SuperAdminDiceRewards() {
	const [version, setVersion] = useState<Version>("v1");
	const [rewardPercent, setRewardPercent] = useState<Record<DiceNumber, number>>({
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
		6: 0,
	});
	const [savedRewards, setSavedRewards] = useState<DiceRewardRow[]>([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const rewardArrayPayload = useMemo(
		() => diceNumbers.map((num) => ({ diceNumber: num, percent: rewardPercent[num] })),
		[rewardPercent]
	);

	const fetchRewards = async (v: Version) => {
		try {
			const res = await axios.get<DiceRewardRow[]>(`/api/dice-reward?version=${v}`);
			const data: Record<DiceNumber, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
			res.data.forEach((row) => {
				data[row.diceNumber] = row.percent;
			});
			setRewardPercent(data);
			setSavedRewards(res.data);
		} catch (err) {
			console.error("Failed to load dice rewards", err);
			setMessage("Failed to load dice rewards");
		}
	};

	useEffect(() => {
		fetchRewards(version);
	}, [version]);

	const handleChange = (num: DiceNumber, value: number) => {
		setRewardPercent((prev) => ({ ...prev, [num]: value }));
	};

	const handleSave = async () => {
		setLoading(true);
		setMessage("");
		try {
			await axios.post("/api/dice-reward/save", { version, rewards: rewardArrayPayload });
			setMessage("Reward Percentage Saved Successfully ✅");
			fetchRewards(version);
		} catch (err) {
			console.error("Save failed", err);
			setMessage("Save Failed ❌");
		} finally {
			setLoading(false);
			setTimeout(() => setMessage(""), 3000);
		}
	};

	return (
		<div className="container-fluid py-3">
			<h3 className="mb-3">Super Admin: Dice Rewards (Version-wise)</h3>

			<div className="d-flex align-items-center gap-2 mb-3">
				<span className="fw-bold">Version:</span>
				<select
					className="form-select w-auto"
					value={version}
					onChange={(e) => setVersion(e.target.value as Version)}
				>
					{versions.map((v) => (
						<option key={v} value={v}>
							{v.toUpperCase()}
						</option>
					))}
				</select>
			</div>

			<div className="card p-3 shadow-sm mb-4">
				<div className="row">
					{diceNumbers.map((num) => (
						<div className="col-md-2 mb-3" key={num}>
							<label className="fw-bold">Dice {num}</label>
							<input
								type="number"
								className="form-control"
								value={rewardPercent[num]}
								onChange={(e) => handleChange(num, Number(e.target.value))}
							/>
						</div>
					))}
				</div>

				<button className="btn btn-success mt-2" onClick={handleSave} disabled={loading}>
					{loading ? "Saving..." : "Save / Update"}
				</button>

				{message && (
					<div className={`mt-2 fw-bold ${message.includes("❌") ? "text-danger" : "text-success"}`}>
						{message}
					</div>
				)}
			</div>

			<div className="card p-3 shadow-sm">
				<h5 className="mb-3">Saved Rewards for {version.toUpperCase()}</h5>
				<div className="table-responsive">
					<table className="table table-bordered table-striped">
						<thead className="table-dark">
							<tr>
								<th>Dice Number</th>
								<th>Reward Percent</th>
							</tr>
						</thead>
						<tbody>
							{savedRewards.map((row) => (
								<tr key={`${version}-${row.diceNumber}`}>
									<td>{row.diceNumber}</td>
									<td>{row.percent}%</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

